require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoLogger = require('./logger');
const connectToDatabase = require('./models/db');
const { loadData } = require("./util/import-mongo/index");
const authRoutes = require("./routes/authRoutes.js");

const app = express();
const corsOptions = {
    origin: [
        process.env.CORS_ORIGIN,
        process.env.CORS_ORIGIN
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
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

app.use('/api/auth', authRoutes);

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

