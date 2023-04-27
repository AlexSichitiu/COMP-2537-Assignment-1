const express = require('express');
const session = require('express-session');
const mongo = require('connect-mongo');
const bcrypt = require('bcrypt');
require('dotenv').config();
const joi = require('joi');

const node_session_secret = process.env.SESSION_SECRET;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_PW = process.env.MONGODB_PW;
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const mongodb_database = process.env.MONGODB_DATABASE;

const sessionExpiryTime = 60 * 60 * 1000; // milliseconds
const salt = 10;

const app = express();
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log("Now listening on port " + port + ".");
});

var atlasURL = `mongodb+srv://${mongodb_user}:${mongodb_PW}@${mongodb_host}/`
var MongoDBStore = mongo.create({
    mongoUrl: atlasURL + 'sessions',
    crypto: {secret: mongodb_session_secret}
});
const MongoClient = require('mongodb').MongoClient;
const database = new MongoClient(atlasURL + '?retryWrites=true', {useNewUrlParser: true, useUnifiedTopology: true});
const users = database.db(mongodb_database).collection('users');

app.use(session({
    secret: node_session_secret,
    store: MongoDBStore,
    saveUnitialized: false,
    resave: true
}));

app.use(express.urlencoded({extended:false}));
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    var html;
    if (req.session.authenticated){
        html = `
        <form action='/members' method='get'>
            <button type="submit">Members</button>
        </form> 
        <form action='/logout' method='get'>
            <button type="submit">Log Out</button>
        </form> 
        `;
    } else {
        html = `
        <form action='/login' method='get'>
            <button type="submit">Log In</button>
        </form>
        <form action='/signup' method='get'>
            <button type="submit">Sign Up</button>
        </form>
        `;
    }
    res.send(html);
});

app.get('/login', (req, res) => {
    var html = `
    <div>Log in below.</div>
    <form action='/log_user_in' method='post'>
        <input name='email' type='email' placeholder='Email Address'> 
        <input name='password' type='password' placeholder='Password'>
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
        <input name='email' type='email' placeholder='Email Address' style='display:block'> 
        <input name='password' type='password' placeholder='Password' style='display:block'>
        <input type='submit' value='Make an Account'>
    </form>
    `;
    res.send(html);
})

app.get('/members', (req, res) => {
    if (req.session.authenticated){
        var image = '/pet' + Math.floor(Math.random() * 3) + '.jpg';
        var html = `<div>Welcome ${req.session.firstname}</div>
            <img src=${image} height='500' width='500'>
            <form action='/logout' method='get'>
                <button type="submit">Log Out</button>
            </form> 
        `;
        res.send(html);
    } else {
        res.redirect('/')
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

app.get('*', (req, res) => {
    res.status(404);
    res.send("<h1>404: Nothing Here!</h1>");
});

app.post('/log_user_in', async (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    var schema = joi.object({
        email: joi.string().max(20).required(),
        password: joi.string().max(20).required(),
    });
    var validCredentials = schema.validate({email, password});

    if (validCredentials.error != null){
        console.log(validCredentials.error);
        res.send(validCredentials.error.toString().substring(17)
            + '</br><a href="/login">Try Again</a>');
    } else {
        var user = await users.find({email: email})
            .project({email: 1, password: 1, firstname:1, _id: 1})
            .toArray();
        if (user.length != 1){
            res.send('<div>Account does not exist for this email.</div><a href="/login">Try Again</a>');
        } else if (await bcrypt.compare(password, user[0].password)){
            req.session.authenticated = true;
            req.session.firstname = user[0].firstname;
            req.session.email = email;
            req.session.cookie.maxAge = sessionExpiryTime;
            res.redirect('/members');
        } else {
            res.send('<div>Invalid email and password combination.</div><a href="/login">Try Again</a>');
        }
    }
})

app.post('/register_user', async (req, res) => {
    var firstname = req.body.firstname;
    var email = req.body.email;
    var password = req.body.password;

    var schema = joi.object({
        firstname: joi.string().alphanum().max(20).required(),
        email: joi.string().max(20).required(),
        password: joi.string().max(20).required(),
    });

    var validSubmission = schema.validate({firstname, email, password});
    if (validSubmission.error != null){
        console.log(validSubmission.error);
        res.send(validSubmission.error.toString().substring(17)
            + '</br><a href="/signup">Try Again</a>');
    } else {
        var encrypted_password = await bcrypt.hash(password, salt); 
        await users.insertOne({
            email: email,
            password: encrypted_password,
            firstname: firstname
        })
        console.log(`Created an account for ${firstname}.`);
        req.session.authenticated = true;
        req.session.firstname = firstname;
        req.session.email = email;
        req.session.cookie.maxAge = sessionExpiryTime;
        res.redirect('/members');
    }
})


    