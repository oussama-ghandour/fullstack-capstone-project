const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino');  // Import Pino logger

const logger = pino();  // Create a Pino logger instance

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;


//register endpoint
router.post('/register', async (req, res) => {
    try {
        // Connect to `giftsdb` in MongoDB 
        const db = await connectToDatabase();

        // Access MongoDB collection
        const collection = db.collection("users");

        // Check for existing email
        const existingEmail = await collection.findOne({ email: req.body.email });

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const email = req.body.email;

        // Save user details in database
        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);
        logger.info('User registered successfully');
        res.json({authtoken,email});
    } catch (e) {
         return res.status(500).send('Internal server error');
    }
});

module.exports = router;



// login endpoint
router.post('/login', async (req, res) => {
    try {
        // Connect to `giftsdb`
        const db  = await connectToDatabase();
        // Access MongoDB `users` collection
        collection = db.collection('users');
        // Check for user credentials in db
        theUser = await collection.findOne({ email: req.body.email});
        // Check if the password matches 
        if (theUser) {
            let result = await bcryptjs.compare(req.body.password, theUser.password)
            if (!result) {
                logger.error('Password do not match');
                return res.status(404).json({ error: 'Wrong password'});
            }

             let payload = {
                  user: {
                    id: theUser_id.toString(),
                },
            };
            const userName =  theUser.firstName;
            const userEmail = theUser.email;
            const authtoken = jwt.sign(payload, JWT_SECRET);
            logger.info('User logged successfully');
            return  res.status(200).json({authtoken, userName, userEmail });  
        } else {
            logger.error('User not found');
            return res.status(404).json({error: 'User not found'});

        }
    } catch (e) {
        logger.error(e);
         return res.status(500).send('Internal server error');

    }
});
// profil endpoint
router.put('/update', async (req, res) => {
   
    const errors = validationResult(req);
    // Check if `email` is present in the header 
    if (!errors.isEmpty()) {
        logger.error('Validation errors in update request', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const email = req.headers.email;
        if (!email) {
            logger.error('Email not found in the request headers');
            return res.status(400).json({ error: "Email not found in the request headers" });
        }
        // Connect to MongoDB
        const db = await connectToDatabase();
        const collection = db.collection("users");
        // Find user credentials
        const existingUser = await collection.findOne({ email });
        if (!existingUser) {
            logger.error('User not found');
            return res.status(404).json({ error: "User not found" });
        }
        existingUser.firstName = req.body.name;
        existingUser.updatedAt = new Date();
        // Update user credentials in DB
        const updatedUser = await collection.findOneAndUpdate(
            { email },
            { $set: existingUser },
            { returnDocument: 'after' }
        );
        // Create JWT authentication with user._id as payload
        const payload = {
            user: {
                id: updatedUser._id.toString(),
            },
        };
        const authtoken = jwt.sign(payload, JWT_SECRET);
        logger.info('User updated successfully');
        res.json({ authtoken });
    } catch (error) {
        logger.error(error);
        return res.status(500).send("Internal Server Error");
    }
});
module.exports = router;