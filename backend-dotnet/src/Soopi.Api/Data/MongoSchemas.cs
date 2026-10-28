using MongoDB.Bson;

namespace Soopi.Api.Data;

/// <summary>
/// Ràng buộc $jsonSchema cho các collection nghiệp vụ chính: trường bắt buộc, kiểu BSON (tiền là decimal, thời điểm là date),
/// tập giá trị trạng thái và tiền tố mã nghiệp vụ (TN-, BG-, PT-…; độ dài và ngày do CodeGenerator bảo đảm, dữ liệu nhập tay vẫn hợp lệ). Áp bằng collMod với validationLevel "moderate" (document cũ không hợp lệ vẫn
/// đọc/sửa được) và validationAction "error" (ghi sai bị từ chối ngay tại MongoDB, lớp phòng thủ dưới luật nghiệp vụ của API).
/// Không đặt additionalProperties: false để document nhúng (lịch sử, ghi chú…) mở rộng được mà không phải đổi schema.
/// </summary>
public static class MongoSchemas
{
    private const string Money = """{ "bsonType": "decimal", "minimum": 0 }""";
    private const string Count = """{ "bsonType": ["int", "long"], "minimum": 0 }""";

    public static readonly IReadOnlyDictionary<string, BsonDocument> Validators = new Dictionary<string, BsonDocument>
    {
        ["tickets"] = Schema($$"""
        {
          "bsonType": "object",
          "title": "Phiếu tiếp nhận",
          "required": ["_id", "stationCode", "receivedAt", "customerId", "deviceId", "status", "sla", "statusHistory", "open"],
          "properties": {
            "_id": { "bsonType": "string", "pattern": "^TN-" },
            "receivedAt": { "bsonType": "date" },
            "customerId": { "bsonType": "string" },
            "deviceId": { "bsonType": "string" },
            "channel": { "enum": ["COUNTER", "MOBILE_APP", "ONLINE_REQUEST", "PHONE"] },
            "requestType": { "enum": ["WARRANTY", "PAID_REPAIR"] },
            "status": { "enum": ["RECEIVED", "INSPECTING", "DIAGNOSED", "AWAITING_QUOTE_APPROVAL", "AWAITING_CUSTOMER_CONFIRMATION",
                                 "AWAITING_PARTS", "AWAITING_RETURN", "REPAIRING", "COMPLETED", "DELIVERED", "RETURNED_UNREPAIRED"] },
            "estimatedCost": {{Money}},
            "sla": {
              "bsonType": "object", "required": ["level", "dueAt"],
              "properties": { "level": { "enum": ["EXPRESS_12H", "PRIORITY_24H", "STANDARD_48H"] }, "dueAt": { "bsonType": "date" } }
            },
            "statusHistory": { "bsonType": "array", "minItems": 1, "items": { "bsonType": "object", "required": ["status", "at"] } },
            "open": { "bsonType": "bool" },
            "version": {{Count}}
          }
        }
        """),
        ["quotations"] = Schema($$"""
        {
          "bsonType": "object",
          "title": "Báo giá",
          "required": ["_id", "ticketId", "lines", "partsTotal", "laborTotal", "grandTotal", "vatRate", "approval", "customerDecision"],
          "properties": {
            "_id": { "bsonType": "string", "pattern": "^BG-" },
            "ticketId": { "bsonType": "string" },
            "lines": {
              "bsonType": "array", "minItems": 1,
              "items": { "bsonType": "object", "required": ["quantity"], "properties": { "quantity": { "bsonType": ["int", "long"], "minimum": 1 } } }
            },
            "partsTotal": {{Money}}, "laborTotal": {{Money}}, "grandTotal": {{Money}},
            "vatRate": { "bsonType": "decimal", "minimum": 0, "maximum": 100 },
            "approval": {
              "bsonType": "object", "required": ["status"],
              "properties": { "status": { "enum": ["PENDING", "APPROVED", "REJECTED", "SUPERSEDED", "EXPIRED", "CANCELLED"] } }
            },
            "customerDecision": {
              "bsonType": "object", "required": ["status"],
              "properties": { "status": { "enum": ["PENDING", "ACCEPTED", "DECLINED"] } }
            }
          }
        }
        """),
        ["payments"] = Schema($$"""
        {
          "bsonType": "object",
          "title": "Phiếu thu",
          "required": ["_id", "ticketId", "type", "paidAt", "amount", "method", "cashierId"],
          "properties": {
            "_id": { "bsonType": "string", "pattern": "^PT-" },
            "ticketId": { "bsonType": "string" },
            "type": { "enum": ["CHARGED", "FREE_WARRANTY"] },
            "paidAt": { "bsonType": "date" },
            "amount": {{Money}},
            "method": { "enum": ["CASH", "BANK_TRANSFER", "E_WALLET", "CARD", "NONE"] }
          }
        }
        """),
        ["customers"] = Schema("""
        {
          "bsonType": "object",
          "title": "Khách hàng",
          "required": ["_id", "fullName", "phone", "status", "createdAt"],
          "properties": {
            "_id": { "bsonType": "string", "pattern": "^KH-" },
            "fullName": { "bsonType": "string", "minLength": 1 },
            "phone": { "bsonType": "string", "pattern": "^0\\d{9,10}$" },
            "email": { "bsonType": ["string", "null"] },
            "status": { "enum": ["ACTIVE", "ARCHIVED", "MERGED"] },
            "createdAt": { "bsonType": "date" }
          }
        }
        """),
        ["devices"] = Schema("""
        {
          "bsonType": "object",
          "title": "Thiết bị",
          "required": ["_id", "productId", "identifierType", "serialNormalized", "customerId"],
          "properties": {
            "_id": { "bsonType": "string", "pattern": "^TB-" },
            "identifierType": { "enum": ["IMEI", "SERIAL"] },
            "serialNormalized": { "bsonType": "string", "minLength": 1 },
            "warrantyActivatedOn": { "bsonType": ["string", "null"], "pattern": "^\\d{4}-\\d{2}-\\d{2}$" },
            "warrantyExpiresOn": { "bsonType": ["string", "null"], "pattern": "^\\d{4}-\\d{2}-\\d{2}$" }
          }
        }
        """),
        ["parts"] = Schema($$"""
        {
          "bsonType": "object",
          "title": "Linh kiện",
          "required": ["_id", "name", "onHand", "reserved", "servicePrice", "active"],
          "properties": {
            "name": { "bsonType": "string", "minLength": 1 },
            "onHand": {{Count}}, "reserved": {{Count}}, "minLevel": {{Count}},
            "costPrice": {{Money}}, "servicePrice": {{Money}},
            "bins": { "bsonType": "array", "items": { "bsonType": "object", "required": ["binCode", "qty"], "properties": { "qty": {{Count}} } } },
            "active": { "bsonType": "bool" }
          }
        }
        """),
        ["stock_issues"] = Schema("""
        {
          "bsonType": "object",
          "title": "Phiếu xuất kho",
          "required": ["_id", "ticketId", "source", "status", "lines"],
          "properties": {
            "_id": { "bsonType": "string", "pattern": "^PX-" },
            "source": { "enum": ["QUOTATION", "FREE_WARRANTY"] },
            "status": { "enum": ["PENDING", "ISSUED", "REJECTED", "CANCELLED", "RETURNED"] },
            "lines": {
              "bsonType": "array", "minItems": 1,
              "items": { "bsonType": "object", "required": ["sku", "quantity"], "properties": { "quantity": { "bsonType": ["int", "long"], "minimum": 1 } } }
            }
          }
        }
        """),
    };

    private static BsonDocument Schema(string json) => BsonDocument.Parse(json);
}
