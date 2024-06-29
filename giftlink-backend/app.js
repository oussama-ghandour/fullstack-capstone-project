require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoLogger = require('./logger');
const connectToDatabase = require('./models/db');
const authRoutes = require('./routes/authRoutes.js');

const app = express();
const corsOptions = {
    origin: [
        "https://oussam92ing-3000.theiaopenshiftnext-0-labs-prod-theiaopenshift-4-tor01.proxy.cognitiveclass.ai"
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));

const port = 3060;

connectToDatabase().then(() => {
    pinoLogger.info('Connected to DB');
}).catch((e) => console.error('Failed to connect to DB', e));

app.use(express.json());

const giftRoutes = require('./routes/giftRoutes');
const searchRoutes = require('./routes/searchRoutes');

const pinoHttp = require('pino-http');
const logger = require('./logger');

app.use(pinoHttp({ logger }));

app.use('/api/auth', authRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/search', searchRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});

app.get("/", (req, res) => {
    res.send("Inside the server");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


