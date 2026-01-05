const express = require('express');
const cors = require('cors');
require('dotenv').config();
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

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o0d4b4z.mongodb.net/?appName=Cluster0`;

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
        

        const db = client.db('utility_db');
        const billsColl = db.collection('bills');
        const usersColl = db.collection('users');
        const usersBillsColl = db.collection('usersBills')
        const reviewsCollection = db.collection('reviews')
        const issuesCollection = db.collection('issues')

        app.get('/users/:email', async(req,res)=>{
            const email = req.params.email;
            const result = await usersColl.findOne( { email : email });
            res.send(result);
        })

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

        app.patch('/users/:email', async (req, res) => {
            const email = req.params.email;
            const updatedProfile = req.body;

            const result = await usersColl.updateOne(
                {email},
                {$set: updatedProfile}
            );
            res.send(result)
        })

        app.get('/issues', async(req,res)=>{
            const cursor = issuesCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/issues', async(req,res)=>{
            const issue = req.body;
            const result = await issuesCollection.insertOne(issue);
            res.send(result)
        })

        app.get('/bills', async (req, res) => {
            const { limit = 0, skip = 0, sort = "date", order = "desc", search = "" } = req.query;
            const sortOption = {};

            let query = {};
            if(search){
                query.title = { $regex : search, $options : "i" };
            }

            sortOption[sort || "date"] = order === 'asc' ? 1 : -1 ;

            const cursor = billsColl.find(query).sort(sortOption).limit(Number(limit)).skip(Number(skip));
            const bills = await cursor.toArray();
            const count = await billsColl.countDocuments();
            res.send({bills, total:count})
        })

        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/reviews', async(req,res)=>{
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result)
        })

        app.get('/bills/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await billsColl.findOne(query)
            res.send(result)
        })

        app.get('/recent-bills', async (req, res) => {
            const cursor = billsColl.find().limit(6);
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/usersBills', async (req, res) => {

            const email = req.query.email;
            const query = {};
            if (email) {
                query.email = email;
            }

            const cursor = usersBillsColl.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        app.patch('/usersBills/:id', async (req, res) => {
            const billId = req.params.id;
            const updatedBill = req.body;
            const query = { _id: new ObjectId(billId) };
            const updateResult = {
                $set: updatedBill
            };

            const result = await usersBillsColl.updateOne(query, updateResult);
            res.send(result)
        })

        app.delete('/usersBills/:id', async (req, res) => {
            const billId = req.params.id;
            const query = { _id: new ObjectId(billId) };
            const result = await usersBillsColl.deleteOne(query);
            res.send(result)
        });

        app.post('/bills', async (req, res) => {
            const newBill = req.body;
            const result = await billsColl.insertOne(newBill);
            res.send(result)
        })

        app.post('/usersBills', async (req, res) => {
            const addedBill = req.body;
            const result = await usersBillsColl.insertOne(addedBill);
            res.send(result);
        })

        app.get('/usersBills/:email', async(req,res)=>{
            const email = req.params.email;
            const cursor = usersBillsColl.find({ email: email });
            const result = await cursor.toArray();
            res.send(result)
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
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);