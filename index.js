const express = require('express');
const session = require('express-session');
const mongo = require('connect-mongo');
const bcrypt = require('bcrypt');
require('dotenv').config();

const node_session_secret = process.env.SESSION_SECRET;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_PW = process.env.MONGODB_PW;
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;


const expiryTime = 60 * 60 * 1000; // milliseconds

const app = express();
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log("Now listening on port " + port + ".");
});

var MongoDBStore = mongo.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_PW}@${mongodb_host}/sessions`,
    crypto: {secret: mongodb_session_secret}
});


app.use(session({
    secret: node_session_secret,
    store: MongoDBStore,
    saveUnitialized: false,
    resave: true
}));


app.get('/', (req, res) => {
    res.send("<header>Testing!</header>");
});

app.get('*', (req, res) => {
    res.status(404);
    res.send("<h1>404: File not found</h1>");
});