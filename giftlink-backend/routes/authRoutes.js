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
module.exports = router;