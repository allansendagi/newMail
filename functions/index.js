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
	  unlikeMail,
	  deleteMail
	} = require('./handlers/mails');
const { 
	signUp,
	login,
	uploadImage,
	addUserDetails,
	getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead
} = require('./handlers/users')




// const firebase = require('firebase');
// firebase.initializeApp(firebaseConfig);


//mail routes
app.get('/mails', getAllMails);
app.post('/update', FBAuth, postOneMail);
app.get('/update/:mailId', getMail)
app.delete('/update/:mailId', FBAuth, deleteMail);
app.post('/update/:mailId/comment', FBAuth, commentOnMail)
app.get('/update/:mailId/like', FBAuth, likeMail);
app.get('/update/:mailId/unlike', FBAuth, unlikeMail)




//usersRoutes
app.post('/signup', signUp);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
app.get('/user/:handle', getUserDetails);
app.post('/notifications',FBAuth, markNotificationsRead);


exports.api = functions.https.onRequest(app);

exports.createNotificationOnlike = functions.firestore.document('likes/{id}')
   .onCreate((snapshot) => {
   	db.doc(`/mails/${snapshot.data().mailId}`)
      .get()
   	  .then((doc) => {
   	  	if (doc.exists) {
   	  		return db.doc(`/notifications/${snapshot.id}`)
             .set({
   	  			createdAt: new Date().toISOString(),
   	  			recipient: doc.data().userHandle,
   	  			sender: snapshot.data().userHandle,
   	  			type: 'like',
   	  			read: false,
   	  			mailId: doc.id
   	  		})
   	  	}
   	  })
   	  .then(() => {
   	  	return
   	  })
   	  .catch((err) => {
   	  	console.error(err);
   	  	return 
   	  })
   })
exports.deleteNotificationOnUnLike = functions
   .firestore.document('likes/{id}')
   .onDelete((snapshot)=> {
      db.doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(()=>{
         return;
      })
      .catch((err)=> {
         return;
      })
   })



exports.createNotificationOnComment = functions
	.firestore.document('comments/{id}')
   .onCreate((snapshot)=> {
         db.doc(`/mails/${snapshot.data().mailId}`)
      .get()
        .then((doc) => {
         if (doc.exists) {
            return db.doc(`/notifications/${snapshot.id}`)
             .set({
               createdAt: new Date().toISOString(),
               recipient: doc.data().userHandle,
               sender: snapshot.data().userHandle,
               type: 'comment',
               read: false,
               mailId: doc.id
            })
         }
        })
        .then(() => {
         return
        })
        .catch((err) => {
         console.error(err);
         return 
        })
   });





















