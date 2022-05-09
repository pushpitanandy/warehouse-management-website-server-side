const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zzmw0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const perfumeCollection = client.db('perfumeInventory').collection('perfume');

        //to load all perfumes
        app.get('/perfume', async (req, res) => {
            const query = {};
            const cursor = perfumeCollection.find(query);
            const perfumes = await cursor.toArray();
            res.send(perfumes);
        });

        //to load single perfume
        app.get('/perfume/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const perfume = await perfumeCollection.findOne(query);
            res.send(perfume);
        });

        //add an item to the database
        app.post('/perfume', async (req, res) => {
            const newPerfume = req.body;
            const result = await perfumeCollection.insertOne(newPerfume);
            res.send(result);
        });

        //delete an item
        app.delete('/perfume/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await perfumeCollection.deleteOne(query);
            res.send(result);
        });

        //update the quantity
        app.put('/perfume/:id', async (req, res) => {
            const id = req.params.id;
            const updatedPerfume = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedPerfume.quantity
                }
            };
            const result = await perfumeCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        //load data for a particular user
        app.get('/userItems', async (req, res) => {
            const email = req.query.email;
            console.log(email);
            const query = { email };
            const cursor = perfumeCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        })
    } finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running inventory server');
});

app.listen(port, () => {
    console.log('Listening to port', port);
});