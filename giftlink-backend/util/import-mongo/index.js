require('dotenv').config();
console.log('MONGO_URL:', process.env.MONGO_URL);
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');


// Check if MONGO_URL is set
if (!process.env.MONGO_URL) {
    console.error('MONGO_URL is not defined in the .env file.');
    process.exit(1);
}

const url = process.env.MONGO_URL;
const filename = path.join(__dirname, 'gifts.json');
const dbName = 'giftdb';
const collectionName = 'gifts';

// Read and parse the JSON file
let data;
try {
    data = JSON.parse(fs.readFileSync(filename, 'utf8')).docs;
} catch (err) {
    console.error('Error reading or parsing the gifts.json file:', err);
    process.exit(1);
}

// Function to connect to the database and insert data into the collection
async function loadData() {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Connect to the MongoDB client
        await client.connect();
        console.log("Connected successfully to server");

        // Select the database and collection
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Check if the collection already contains documents
        const cursor = await collection.find({});
        const documents = await cursor.toArray();

        if (documents.length === 0) {
            // Insert data into the collection
            const insertResult = await collection.insertMany(data);
            console.log('Inserted documents:', insertResult.insertedCount);
        } else {
            console.log("Gifts already exist in DB");
        }
    } catch (err) {
        console.error('MongoDB connection or operation error:', err);
    } finally {
        // Close the connection
        await client.close();
    }
}

// Call the loadData function
loadData();

module.exports = {
    loadData,
};

