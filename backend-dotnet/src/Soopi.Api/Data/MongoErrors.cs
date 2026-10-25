using MongoDB.Driver;
using Soopi.Api.Domain.Shared;
namespace Soopi.Api.Data;

public static class MongoErrors
{
    private static readonly Dictionary<string, ErrorCode> UniqueKeys = new()
    {
        ["ticket_open_device"] = ErrorCode.DEVICE_HAS_OPEN_TICKET,
        ["device_serial"] = ErrorCode.DEVICE_SERIAL_DUPLICATE,
        ["customer_phone"] = ErrorCode.CUSTOMER_PHONE_DUPLICATE,
        ["quote_active_ticket"] = ErrorCode.QUOTE_ACTIVE_EXISTS,
        ["issue_pending_ticket"] = ErrorCode.STOCK_ISSUE_PENDING_EXISTS,
        ["payment_ticket"] = ErrorCode.PAYMENT_ALREADY_EXISTS,
        ["account_username"] = ErrorCode.ACCOUNT_USERNAME_DUPLICATE,
    };
    public static Exception Translate(Exception exception)
    {
        if (exception is MongoWriteException { WriteError.Category: ServerErrorCategory.DuplicateKey } || exception is MongoCommandException { Code: 11000 })
        {
            foreach (var (name, code) in UniqueKeys) if (exception.Message.Contains(name, StringComparison.Ordinal)) return new DomainException(code);
            return new DomainException(ErrorCode.CONCURRENT_MODIFICATION);
        }
        return exception;
    }
}
