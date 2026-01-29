# Q7 - Java MongoDB Driver (Connect + Statements + Read/Process)

This folder contains a simple Java program that:
- connects to MongoDB
- inserts sample data
- runs a few MongoDB operations
- prints and processes results

## How to run
1. Install Java (JDK 17+ recommended).
2. Ensure MongoDB is running on `mongodb://localhost:27017`.
3. Open a terminal in this folder and run:
   - `mvn -q clean package`
   - `mvn -q exec:java -Dexec.mainClass=wtlab.q7.App`

## Optional
- Use a custom URI:
  - PowerShell: `$env:MONGO_URI="mongodb://localhost:27017"`

