const express = require('express');
const session = require('express-session');
const mongo = require('connect-mongodb-session');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log("Now listening on port " + port + ".");
});

app.get('/', (req, res) => {
    res.send("<header>Testing!</header>");
});

app.get('*', (req, res) => {
    res.status(404);
    res.send("404: File not found");
})