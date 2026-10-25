using MongoDB.Driver;
using Soopi.Api.Domain.Shared;
namespace Soopi.Api.Data;

public class TransactionRunner(AppDbContext db)
{
    private readonly List<Action> afterCommit = [];
    private readonly List<Action> afterRollback = [];
    public async Task<T> InTransactionAsync<T>(Func<Task<T>> operation)
    {
        if (db.Session?.IsInTransaction == true) return await operation();
        using var session = await db.Client.StartSessionAsync(); db.Session = session;
        try
        {
            for (var attempt = 1; ; attempt++)
            {
                session.StartTransaction(new TransactionOptions(ReadConcern.Snapshot, ReadPreference.Primary, WriteConcern.WMajority));
                var commitAttempted = false;
                try
                {
                    var result = await operation(); await db.SaveChangesAsync();
                    // Unknown commit result retries the same commit, never replays a payment.
                    using var commitTimeout = new CancellationTokenSource(TimeSpan.FromSeconds(30));
                    commitAttempted = true;
                    while (true)
                    {
                        try { await CommitAsync(session, commitTimeout.Token); break; }
                        catch (MongoException ex) when (ex.HasErrorLabel("UnknownTransactionCommitResult") && !commitTimeout.IsCancellationRequested) { continue; }
                    }
                    db.Session = null;
                    var actions = afterCommit.ToArray(); afterCommit.Clear(); afterRollback.Clear();
                    foreach (var action in actions) action();
                    return result;
                }
                catch (Exception exception)
                {
                    if (session.IsInTransaction) await session.AbortTransactionAsync();
                    db.ClearTracking(); afterCommit.Clear();
                    var transient = exception is MongoException mongo && mongo.HasErrorLabel("TransientTransactionError");
                    if (ShouldCompensateRollback(commitAttempted, transient))
                    {
                        var rollback = afterRollback.ToArray(); afterRollback.Clear();
                        foreach (var action in rollback) action();
                    }
                    else
                    {
                        afterRollback.Clear();
                    }
                    if (exception is MongoConcurrencyException || transient)
                    {
                        if (attempt < 3) continue;
                        throw new DomainException(ErrorCode.CONCURRENT_MODIFICATION);
                    }
                    throw MongoErrors.Translate(exception);
                }
            }
        }
        finally { db.Session = null; }
    }
    public Task InTransactionAsync(Func<Task> operation) => InTransactionAsync(async () => { await operation(); return true; });
    /// <summary>Điểm nối để test giả lập lỗi commit (vd OperationCanceledException khi hết 30 giây).</summary>
    protected virtual Task CommitAsync(IClientSessionHandle session, CancellationToken token) =>
        session.CommitTransactionAsync(token);
    public void AfterCommit(Action action) { if (db.Session?.IsInTransaction == true) afterCommit.Add(action); else action(); }
    /// <summary>Đăng ký bù trừ chạy khi transaction rollback xác định (không chạy khi kết quả commit chưa xác định).</summary>
    public void AfterRollback(Action action) { if (db.Session?.IsInTransaction == true) afterRollback.Add(action); }
    /// <summary>
    /// Chỉ chạy bù trừ rollback (vd xóa tệp) khi chắc chắn transaction CHƯA commit: chưa gọi commit, hoặc commit bị từ chối
    /// dứt khoát (nhãn TransientTransactionError). Đã gọi commit mà gặp lỗi khác (UnknownTransactionCommitResult, hay
    /// OperationCanceledException do hết 30 giây commit) thì kết quả chưa rõ → giữ tệp, không xóa.
    /// </summary>
    public static bool ShouldCompensateRollback(bool commitAttempted, bool transientError) =>
        !commitAttempted || transientError;
}
