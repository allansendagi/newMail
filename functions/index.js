const functions = require('firebase-functions');

const express = require('express')
const app = express();

const FBAuth = require('./util/fbauth');

const { 
	  getAllMails, 
	  postOneMail, 
	  getMail, 
	  commentOnMail } = require('./handlers/mails');
const { 
	signUp,
	login,
	uploadImage,
	addUserDetails,
	getAuthenticatedUser
} = require('./handlers/users')




// const firebase = require('firebase');
// firebase.initializeApp(firebaseConfig);


//mail routes
app.get('/mails', getAllMails);
app.post('/update', FBAuth, postOneMail);
app.get('/update/:mailId', getMail)
//TODO delete mails
//like a mail
//unlike mails
//comment 
app.post('/update/:mailId/comment', FBAuth, commentOnMail)

//usersRoutes
app.post('/signup', signUp);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser)


exports.api = functions.https.onRequest(app);




















