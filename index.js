const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();


const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB setup
const uri = process.env.MONGODB_URI;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const parcelCollection = client.db("parcelDB").collection("parcels");

    // parcels api

    // parcels GET API with email filter + sorting
    app.get('/parcels', async (req, res) => {
      try {
        const { email } = req.query;
        const query = email ? { createdBy: email } : {};
        const parcels = await parcelCollection.find(query).sort({ createdAt: -1 }).toArray();
        res.json(parcels);
      } catch (error) {
        console.error('Error fetching parcels:', error);
        res.status(500).json({ error: 'Failed to fetch parcels' });
      }
    });




    // post api for parcels

    app.post("/parcels", async (req, res) => {
    try {
        const parcel = req.body;

        // Optional: Validate the data here
        if (!parcel.sender || !parcel.receiver || !parcel.address) {
        return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await parcelCollection.insertOne(parcel);
        res.status(201).json({
        message: "Parcel added successfully",
        insertedId: result.insertedId,
        });

    } catch (error) {
        console.error("Error adding parcel:", error);
        res.status(500).json({ message: "Internal server error" });
    }
    });

    // delete api for parcels
    app.delete('/parcels/:id', async (req, res) => {
      const id = req.params.id;

      try {
        const result = await parcelCollection.deleteOne({ _id: new ObjectId(id) });

        res.send(result);
      } catch (error) {
        console.error('Delete error:', error);
        res.status(500).send({ message: 'Internal server error' });
      }
    });



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



// sample route
app.get('/', (req, res) => {
    res.send("Parcel server is running")
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});