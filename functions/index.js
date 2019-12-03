const functions = require('firebase-functions');

const express = require('express')
const app = express();

const FBAuth = require('./util/fbauth');

const { getAllMails } = require('./handlers/mails');
const { signup, login } = require('./handlers/users')




const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);


//mail routes
app.get('/mails', getAllMails);
app.post('/update', FBAuth, postOneUpdate);

//usersRoutes
app.post('/signup', signUp);
app.post('/login', login)


exports.api = functions.https.onRequest(app);




















