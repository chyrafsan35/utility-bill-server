const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running')
})

app.listen(port, () => {
    console.log(`Server is running on port : ${port}`)
})


const uri = "mongodb+srv://utilitydb:GFtQqCzCiy90Tdl9@cluster0.o0d4b4z.mongodb.net/?appName=Cluster0";

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

        const db = client.db('utility_db');
        const billsColl = db.collection('bills');
        const usersColl = db.collection('users');
        const usersBillsColl = db.collection('usersBills')

        app.post('/users', async (req, res) => {
            const newUser = req.body;

            const email = req.body.email;
            const query = { email: email };
            const existingUser = await usersColl.findOne(query);
            if (existingUser) {
                res.send('User already exists')
            } else {
                const result = await usersColl.insertOne(newUser);
                res.send(result)
            }
        })

        app.get('/bills', async (req, res) => {
            const cursor = billsColl.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/bills/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id : new ObjectId(id) }
            const result = await billsColl.findOne(query)
            res.send(result)
        })

        app.get('/recent-bills', async (req, res) => {
            const cursor = billsColl.find().limit(6);
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/bills', async (req, res) => {
            const newBill = req.body;
            const result = await billsColl.insertOne(newBill);
            res.send(result)
        })

        app.post('/usersBills', async (req, res)=>{
            const addedBill = req.body;
            const result = await usersBillsColl.insertOne(addedBill);
            res.send(result);
        })

        app.patch('/bills/:id', async (req, res) => {
            const id = req.params.id;
            const updateBill = req.body;
            const query = { _id: new ObjectId(id) };
            const update = {
                $set: updateBill
            }
            const result = await billsColl.updateOne(query, updateBill);
            res.send(result)
        })

        app.delete('/bills/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await billsColl.deleteOne(query);
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);