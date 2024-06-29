const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino');  


const app = express();

//Create a Pino logger instance
const logger = pino();


dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    try {
      
        const db = await connectToDatabase();     

        // Access MongoDB collection
         const collection = db.collection('users');

        // Check for existing email
         const existingEmail = await collection.findOne({email: req.body.email});

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const email = req.body.email;

        // Save user details in database
        const newUser = await collection.inserOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createAt: new Date(),
        });
        // Create JWT authentication
        const payload = {
            users: {
                id: newUser.insertId,
            },
        };
        const authtoken = jwt.sign(payload, JWT_SECRET);
        logger.info('User registered successfully');
        res.json({authtoken,email});
    } catch (e) {
         return res.status(500).send('Internal server error');
    }
});

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
module.exports = router;