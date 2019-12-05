const functions = require('firebase-functions');

const express = require('express')
const app = express();

const FBAuth = require('./util/fbauth');

const { getAllMails, postOneMail } = require('./handlers/mails');
const { signUp, login, uploadImage} = require('./handlers/users')




// const firebase = require('firebase');
// firebase.initializeApp(firebaseConfig);


//mail routes
app.get('/mails', getAllMails);
app.post('/update', FBAuth, postOneMail);

//usersRoutes
app.post('/signup', signUp);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage)


exports.api = functions.https.onRequest(app);




















