using MongoDB.Bson;
using Soopi.Api.Domain.Shared;
using static Soopi.Api.Data.MongoDocuments;
namespace Soopi.Api.Data.Stores;

public sealed record ProductInfo(string Id, string BrandId, IReadOnlyDictionary<string, string?> Snapshot, int DefaultWarrantyMonths, string? PolicyId, int? PolicyWarrantyMonths, string? Conditions, string? RejectionCases, string? Distributor);
public sealed class ProductCatalog(MongoDocuments docs)
{
    public async Task<ProductInfo> RequireProductAsync(string productId, bool activeOnly = true)
    {
        var filter = Eq("_id", productId); if (activeOnly) filter["active"] = true;
        var product = await docs.GetAsync("products", filter) ?? throw new DomainException(ErrorCode.NOT_FOUND);
        var brand = await docs.GetAsync("brands", Eq("_id", product["brandId"]));
        var category = await docs.GetAsync("device_categories", Eq("deviceTypes.code", product["deviceTypeCode"]));
        var type = category?.GetValue("deviceTypes", new BsonArray()).AsBsonArray.Select(t => t.AsBsonDocument).FirstOrDefault(t => t["code"] == product["deviceTypeCode"]);
        if (brand is null || type is null) throw new DomainException(ErrorCode.NOT_FOUND);
        var policies = await docs.ListAsync("warranty_policies", Document(("active", true), ("$or", new BsonArray { Document(("scope", "PRODUCT"), ("productId", productId)), Document(("scope", "BRAND"), ("brandId", product["brandId"])) })));
        var policy = policies.OrderBy(p => p["scope"] == "PRODUCT" ? 0 : 1).ThenBy(p => p["_id"].AsString).FirstOrDefault();
        string? Text(BsonDocument? d, string key) => d?.GetValue(key, BsonNull.Value) is { IsBsonNull: false } v ? v.AsString : null;
        var snapshot = new Dictionary<string, string?> { ["name"] = Text(product, "name"), ["brandId"] = Text(product, "brandId"), ["brandName"] = Text(brand, "name"), ["categoryCode"] = Text(category, "_id"), ["deviceTypeCode"] = Text(type, "code"), ["deviceTypeName"] = Text(type, "name"), ["identifierType"] = Text(type, "identifierType") };
        return new ProductInfo(productId, product["brandId"].AsString, snapshot, product.GetValue("defaultWarrantyMonths", 0).ToInt32(), Text(policy, "_id"), policy?.GetValue("warrantyMonths", 0).ToInt32(), Text(policy, "conditions"), Text(policy, "rejectionCases"), Text(policy, "distributor"));
    }
}
