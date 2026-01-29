package wtlab.q7;

import com.mongodb.client.AggregateIterable;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Sorts;
import org.bson.Document;

import java.time.Instant;
import java.util.Arrays;

public class App {
  public static void main(String[] args) {
    String uri = System.getenv().getOrDefault("MONGO_URI", "mongodb://localhost:27017");
    System.out.println("Connecting to: " + uri);

    try (MongoClient client = MongoClients.create(uri)) {
      MongoDatabase db = client.getDatabase("wt_lab_q7");
      MongoCollection<Document> col = db.getCollection("products");

      // Clean for demo
      col.drop();

      // a) Send various MongoDB statements
      System.out.println("\n=== INSERT MANY ===");
      col.insertMany(Arrays.asList(
          new Document("sku", "A101").append("name", "Keyboard").append("price", 799).append("qty", 30).append("createdAt", Instant.now().toString()),
          new Document("sku", "A102").append("name", "Mouse").append("price", 399).append("qty", 55).append("createdAt", Instant.now().toString()),
          new Document("sku", "A103").append("name", "USB Hub").append("price", 499).append("qty", 18).append("createdAt", Instant.now().toString()),
          new Document("sku", "A104").append("name", "Webcam").append("price", 1599).append("qty", 10).append("createdAt", Instant.now().toString())
      ));
      System.out.println("Count after insert: " + col.countDocuments());

      System.out.println("\n=== FIND (price >= 500), SORT by price DESC ===");
      for (Document d : col.find(Filters.gte("price", 500)).sort(Sorts.descending("price"))) {
        System.out.println(d.toJson());
      }

      System.out.println("\n=== UPDATE ONE (set qty for A103) ===");
      col.updateOne(Filters.eq("sku", "A103"), new Document("$set", new Document("qty", 25)));
      System.out.println(col.find(Filters.eq("sku", "A103")).first().toJson());

      System.out.println("\n=== DELETE ONE (sku=A102) ===");
      col.deleteOne(Filters.eq("sku", "A102"));
      System.out.println("Count after delete: " + col.countDocuments());

      // b) Retrieve and process results received from the database
      System.out.println("\n=== AGGREGATION: total stock value ===");
      AggregateIterable<Document> agg = col.aggregate(Arrays.asList(
          new Document("$project", new Document("sku", 1)
              .append("name", 1)
              .append("stockValue", new Document("$multiply", Arrays.asList("$price", "$qty")))),
          new Document("$group", new Document("_id", null)
              .append("totalStockValue", new Document("$sum", "$stockValue"))
              .append("items", new Document("$push", new Document("sku", "$sku").append("value", "$stockValue"))))
      ));

      Document result = agg.first();
      if (result != null) {
        System.out.println(result.toJson());
        int total = result.getInteger("totalStockValue", 0);
        System.out.println("Processed (integer) totalStockValue = " + total);
      } else {
        System.out.println("No aggregation result.");
      }

      System.out.println("\nDone.");
    }
  }
}

