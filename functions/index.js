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
   	return db.doc(`/mails/${snapshot.data().mailId}`)
      .get()
   	  .then((doc) => {
   	  	if (doc.exists && doc.data().userHandle !==snapshot.data().userHandle) {
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
   	  .catch((err) => console.error(err))
   });
exports.deleteNotificationOnUnLike = functions
   .firestore.document('likes/{id}')
   .onDelete((snapshot)=> {
      return db.doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err)=> {
        console.error(err)
         return;
      })
   })



exports.createNotificationOnComment = functions
	.firestore.document('comments/{id}')
   .onCreate((snapshot)=> {
        return db.doc(`/mails/${snapshot.data().mailId}`)
      .get()
        .then((doc) => {
         if (doc.exists && doc.data().userHandle !==snapshot.data().userHandle) {
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
        .catch((err) => {
         console.error(err);
         return 
        })
   });
   exports.onUserImageChange = functions
    .firestore.document('/users/{userId}')
    .onUpdate((change) => {
      console.log(change.before.data());
      console.log(change.after.data());

      if (change.before.data().imageUrl !== change.after.data().imageUrl) {
        console.log('image has changed');
      let batch = db.batch();
      return db.collection('mails').where('userHandle', '==', change.before.data().handle).get()
        .then((data) => {
          data.forEach(doc => {
            const mail = db.doc(`/mails/${doc.id}`);
            batch.update(mail, {userImage: change.after.data().imageUrl})
          })
          return batch.commit()
        })
      } else return true;
    })

    exports.onMailDelete = functions
    .firestore.document('/mails/{mailId}')
    .onDelete((snapshot, context) => {
      const screamId = context.params.mailId;
      const batch = db.batch();
      return db.collection('comments').where('mailId', '==', mailId).get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/comments/&{doc.id}`));
        })
        return db.collection('likes').where('mailId', '==', mailId)
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        })
        return db.collection('notifications').where('mailId', '==', mailId)
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        })
        return batch.commit();
      })
      .catch(err => console.error(err));
    })





















