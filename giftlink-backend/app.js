/*jshint esversion: 8 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoLogger = require('./logger');

const connectToDatabase = require('./models/db');
const { loadData } = require("./util/import-mongo/index");

const app = express();

// Configure CORS
const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

const port = 3060;

// Connect to MongoDB; we just do this one time
connectToDatabase().then(() => {
    pinoLogger.info('Connected to DB');
})
.catch((e) => console.error('Failed to connect to DB', e));

app.use(express.json());

// Route files Gift API
const giftRoutes = require('./routes/giftRoutes');

// import the searchRoutes
const searchRoutes = require('./routes/searchRoutes');

const pinoHttp = require('pino-http');
const logger = require('./logger');

app.use(pinoHttp({ logger }));

// Use Routes add the giftRoutes to the server
app.use('/api/gifts', giftRoutes);

// Use Routes add the searchRoutes to the server
app.use('/api/search', searchRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});

app.get("/", (req, res) => {
    res.send("Inside the server")
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
