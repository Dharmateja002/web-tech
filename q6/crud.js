// Q6: MongoDB schema + CRUD demo
// Run in mongosh: load("crud.js")

use wt_lab_q6;

// Drop old collection if exists (safe for demo)
db.students.drop();

// "Schema" using JSON schema validation
db.createCollection("students", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["rollNo", "name", "dept", "cgpa", "createdAt"],
      properties: {
        rollNo: { bsonType: "int", minimum: 1 },
        name: { bsonType: "string", minLength: 1 },
        dept: { bsonType: "string", minLength: 2 },
        cgpa: { bsonType: "double", minimum: 0, maximum: 10 },
        phone: { bsonType: ["string", "null"] },
        createdAt: { bsonType: "date" },
      },
    },
  },
});

db.students.createIndex({ rollNo: 1 }, { unique: true });

print("\n=== INSERT (Create) ===");
db.students.insertMany([
  { rollNo: NumberInt(1), name: "Asha", dept: "CSE", cgpa: 8.4, phone: "9999911111", createdAt: new Date() },
  { rollNo: NumberInt(2), name: "Ravi", dept: "IT", cgpa: 7.9, phone: "9999922222", createdAt: new Date() },
  { rollNo: NumberInt(3), name: "Meera", dept: "ECE", cgpa: 9.1, phone: null, createdAt: new Date() },
]);
printjson(db.students.find().toArray());

print("\n=== FIND (Read) ===");
print("Students with CGPA >= 8.0:");
printjson(db.students.find({ cgpa: { $gte: 8.0 } }, { _id: 0 }).toArray());

print("\n=== UPDATE (Update) ===");
db.students.updateOne({ rollNo: NumberInt(2) }, { $set: { cgpa: 8.2, dept: "CSE" } });
printjson(db.students.findOne({ rollNo: NumberInt(2) }, { _id: 0 }));

print("\n=== DELETE (Delete) ===");
db.students.deleteOne({ rollNo: NumberInt(1) });
print("After delete rollNo=1:");
printjson(db.students.find({}, { _id: 0 }).sort({ rollNo: 1 }).toArray());

print("\n=== EXTRA: Aggregation example ===");
printjson(
  db.students
    .aggregate([
      { $group: { _id: "$dept", avgCgpa: { $avg: "$cgpa" }, count: { $sum: 1 } } },
      { $sort: { avgCgpa: -1 } },
    ])
    .toArray()
);

