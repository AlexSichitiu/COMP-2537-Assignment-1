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
const mongodb_database = process.env.MONGODB_DATABASE;

const sessionExpiryTime = 60 * 60 * 1000; // milliseconds

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
    var html;
    if (req.session.authenticated){
        html = `
        <button type="button" name="members">Members Section</button>
        <button type="button" name="logout">Log Out</button>
        `;
    } else {
        html = `
        <button type="button" name="login">Log In</button>
        <button type="button" name="signup">Sign Up</button>
        `;
    }
    res.send(html);
});

app.get('/login', (req, res) => {
    var html = `
    <form action='/log_user_in' method='post'>
    <input name='email' type='text' placeholder='Email Address'> 
    <input name='password' type='text' placeholder='Password'>
    <input type='submit'>
    </form>
    `
    res.send(html);
})

app.get('/signup', (req, res) => {
    var html = `
    <span>Make a new account!</span>
    <form action='/register_user' method='post'>
    <input name='firstname' type='text' placeholder='First Name' style='display:block'>
    <input name='email' type='text' placeholder='Email Address' style='display:block'> 
    <input name='password' type='text' placeholder='Password' style='display:block'>
    <input type='submit'>
    </form>
    `
    res.send(html);
})

app.get('*', (req, res) => {
    res.status(404);
    res.send("<h1>404: File not found</h1>");
});

app.post('/log_user_in', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

})

app.post('/register_user', (req, res) => {
    var firstname = req.body.firstname;
    var email = req.body.email;
    var password = req.body.password;

})