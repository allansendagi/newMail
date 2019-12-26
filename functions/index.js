const functions = require('firebase-functions');

const express = require('express')
const app = express();

const FBAuth = require('./util/fbauth');
const { db } = require('./util/admin');

const { 
	  getAllMails, 
	  postOneMail, 
	  getMail, 
	  commentOnMail,
	  likeMail,
	  unlikeMail
	} = require('./handlers/mails');
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
app.post('/update/:mailId/comment', FBAuth, commentOnMail)
app.get('/update/:mailId/like', FBAuth, likeMail);
app.get('/update/:mailId/unlike', FBAuth, unlikeMail)




//usersRoutes
app.post('/signup', signUp);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser)


exports.api = functions.https.onRequest(app);




















