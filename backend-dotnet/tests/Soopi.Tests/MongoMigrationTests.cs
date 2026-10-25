using System.Xml.Linq;

namespace Soopi.Tests;

public class MongoMigrationTests
{
    [Fact]
    public void ProjectUsesMongoDriverAndHasNoSqlProvider()
    {
        var root = AppContext.BaseDirectory;
        while (!File.Exists(Path.Combine(root, "src/Soopi.Api/Soopi.Api.csproj"))) root = Directory.GetParent(root)!.FullName;
        var project = XDocument.Load(Path.Combine(root, "src/Soopi.Api/Soopi.Api.csproj"));
        var packages = project.Descendants("PackageReference").Select(p => (string)p.Attribute("Include")!).ToList();
        Assert.Contains("MongoDB.Driver", packages);
        Assert.DoesNotContain("Microsoft.EntityFrameworkCore.SqlServer", packages);
    }
}
