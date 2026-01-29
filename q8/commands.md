## Q8 - zips.json import + aggregation pipelines

Dataset: `http://media.mongodb.org/zips.json`

### 1) Import the dataset

Download and import (Windows PowerShell):

```powershell
# Download
Invoke-WebRequest -Uri "http://media.mongodb.org/zips.json" -OutFile "zips.json"

# Import into MongoDB (make sure mongod is running)
mongoimport --db wt_lab_q8 --collection zips --file "zips.json"
```

Open `mongosh`:

```javascript
use wt_lab_q8
db.zips.countDocuments()
```

---

### 2) Aggregation answers

#### (1) Find all the states that have a city called "BOSTON"

```javascript
db.zips.aggregate([
  { $match: { city: "BOSTON" } },
  { $group: { _id: "$state" } },
  { $sort: { _id: 1 } }
])
```

#### (2) Find all the states and cities whose names include the string "BOST"

```javascript
db.zips.aggregate([
  { $match: { city: { $regex: "BOST", $options: "i" } } },
  { $group: { _id: { state: "$state", city: "$city" } } },
  { $sort: { "_id.state": 1, "_id.city": 1 } }
])
```

#### (3) Each city has several zip codes. Find the city in each state with the most number of zip codes and rank those cities along with the states using the city populations

Meaning:
- First, count how many zip documents per (state, city)
- For each (state, city), sum population
- Then, for each state, pick the city with max zipCount (tie-breaker: higher population)
- Finally, sort across states by population (ranking)

```javascript
db.zips.aggregate([
  {
    $group: {
      _id: { state: "$state", city: "$city" },
      zipCount: { $sum: 1 },
      cityPop: { $sum: "$pop" }
    }
  },
  { $sort: { "_id.state": 1, zipCount: -1, cityPop: -1 } },
  {
    $group: {
      _id: "$_id.state",
      city: { $first: "$_id.city" },
      zipCount: { $first: "$zipCount" },
      cityPop: { $first: "$cityPop" }
    }
  },
  { $sort: { cityPop: -1 } }
])
```

