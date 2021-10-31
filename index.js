const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;
const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ppycm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("travel-expert-db");
        const placeCollection = database.collection("places");
        const bookingCollection = database.collection("booking");
        const customerCollection = database.collection("customer-feedback");

        console.log('db connected')
        //get places api
        app.get('/places', async (req, res) => {
            const cursor = placeCollection.find({});
            const result = await cursor.toArray();
            res.send(result);

        })
        //get single place
        app.get('/places/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const cursor = await placeCollection.findOne(query);
            console.log('item found');
            res.send(cursor);
        })
        //post newq places
        app.post('/addNewplace', async (req, res) => {
            const cursor = req.body;
            const result = await placeCollection.insertOne(cursor);
            res.json(result);
            console.log('inserted')


        })
        //get my bookings
        app.get('/bookings/:email', async (req, res) => {
            // const email = req.params.email;
            // console.log(email);
            // const query = { email: email };
            // const result = await bookingCollection.find(query).toArray();
            const result = await bookingCollection.find({
                Email: req.params.email,
            }).toArray();
            console.log(result);
            res.send(result)
        })
        //get bookings
        app.get('/booking', async (req, res) => {
            const result = await bookingCollection.find({}).toArray();
            res.send(result);
        })
        //get FeedBacks
        app.get('/feedbacks', async (req, res) => {
            const result = await customerCollection.find({}).toArray();
            res.send(result);
        })
        //update api
        app.put('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            console.log('update', id)
            const data = req.body;
            console.log(data);
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    Destination: data.Destination, firstName: data.firstName, LastName: data.LastName, Email: data.Email, PhonNumber: data.PhonNumber, gender: data.gender, days: data.days, Cost: data.Cost, Entry_Date: data.Entry_Date, status: "approved"
                }
            }
            console.log(updateDoc)
            const result = await bookingCollection.updateOne(query, updateDoc, options);
            console.log(result)
            res.json(result)


        })
        //post booking
        app.post('/booking', async (req, res) => {
            const data = req.body;
            console.log(data);
            const result = await bookingCollection.insertOne(data);
            res.json(result)

        })
        //delete single booking
        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            console.log('delete', id)
            const query = { _id: ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.json(result)
        })
    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('hello')
});
app.listen(port, () => {
    console.log('listening port ', port)
})
