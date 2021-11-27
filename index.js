const { MongoClient } = require("mongodb");
const express = require("express");
require("dotenv").config();
const app = express();
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
const { query } = require("express");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8sm07.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const jaguar = client.db("carvana");
    const users = jaguar.collection("users");
    const packages = jaguar.collection("packages");
    const orders = jaguar.collection("orders");
    const reviews = jaguar.collection("reviews");
    // post or submit an order
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orders.insertOne(order);
      res.send(result);
    });
    //add a new package
    app.post("/addPackage", async (req, res) => {
      const order = req.body;
      const result = await packages.insertOne(order);
      res.send(result);
    });
    // finding orders for a user
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const quary = { userMail: email };

      const cursor = orders.find(quary);
      if ((await cursor.count()) === 0) {
        console.log("No Data Found");
      }

      const result = await cursor.toArray();
      res.send(result);
    });
    //getting all packages
    app.get("/packages", async (req, res) => {
      const coursor = packages.find({});
      const result = await coursor.toArray();
      res.send(result);
    });
    //getting products by id
    app.get("/productBy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await packages.findOne(query);
      res.json(product);
    });

    //updating the status of a order
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: false };
      const updateDoc = {
        $set: {
          isPending: status.status,
        },
      };
      const result = await orders.updateOne(filter, updateDoc, options);
      // console.log('updating', id,status.status)
      res.json(result);
    });
    //getting all orders
    app.get(`/tickets`, async (req, res) => {
      const cursor = orders.find({});
      const result = await cursor.toArray();

      res.send(result);
    });

    // deleting orders
    app.delete("/myOrders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orders.deleteOne(query);
      res.json(result);
    });
    // this is for inserting users value to data base
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await users.insertOne(user);
      res.send(result);
    });
    // is is to update users from googel
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await users.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // finding admin or not
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await users.findOne(query);
      let isAdmin = false;
      if (user?.isAdmin) {
        console.log(user.isAdmin);
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const reviewBack = await reviews.insertOne(review);
      res.send(reviewBack);
    });

    app.get("/reviews",async (req,res)=>{
      const review = reviews.find({});
      const result = await review.toArray();
      res.send(result);
    })

    app.get("/reviews", async (req, res) => {
      console.log("object");
      const cursor = reviews.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    app.put("/make/admin", async (req, res) => {
      const user = req.body;
      console.log(user);
      const filter = { email: user.email };
      const updateDoc = { $set: { isAdmin: true } };
      const result = await users.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("carvana is Running");
});
app.listen(port, () => {
  console.log("carvana is Running on PORT:", port);
});
