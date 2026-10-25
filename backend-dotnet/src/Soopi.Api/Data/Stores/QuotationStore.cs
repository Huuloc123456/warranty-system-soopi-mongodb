using MongoDB.Driver;
using Soopi.Api.Domain.Quotations;
namespace Soopi.Api.Data.Stores;

public sealed class QuotationStore(AppDbContext db)
{
    public async Task SaveAsync(Quotation quotation)
    {
        if (!quotation.Persisted) { quotation.Persisted = true; await db.InsertAsync("quotations", quotation); }
        else await db.ReplaceAsync("quotations", Builders<Quotation>.Filter.Eq(q => q.Id, quotation.Id), quotation);
    }
    public Task<Quotation?> FindAsync(string code) => db.FirstAsync<Quotation>("quotations", q => q.Id == code);
    public async Task<bool> HasActiveForTicketAsync(string ticketCode) => await db.Find<Quotation>("quotations", Builders<Quotation>.Filter.Where(q => q.TicketId == ticketCode && (q.Approval.Status == "PENDING" || q.Approval.Status == "APPROVED"))).AnyAsync();
    public Task<Quotation?> FindAcceptedForTicketAsync(string ticketCode) => db.FirstAsync<Quotation>("quotations", q => q.TicketId == ticketCode && q.Approval.Status == "APPROVED" && q.CustomerDecision.Status == "ACCEPTED");
    public Task<List<Quotation>> FindByApprovalStatusAsync(string status, int offset, int limit) => db.Find<Quotation>("quotations", Builders<Quotation>.Filter.Eq(q => q.Approval.Status, status)).SortBy(q => q.CreatedAt).ThenBy(q => q.Id).Skip(offset).Limit(Math.Max(1, limit)).ToListAsync();
    public Task<long> CountByApprovalStatusAsync(string status) => db.Session is null ? db.Collection<Quotation>("quotations").CountDocumentsAsync(Builders<Quotation>.Filter.Eq(q => q.Approval.Status, status)) : db.Collection<Quotation>("quotations").CountDocumentsAsync(db.Session, Builders<Quotation>.Filter.Eq(q => q.Approval.Status, status));
}
