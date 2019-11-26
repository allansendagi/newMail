const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = express();
const express = require('express');



admin.initializeApp();

const config = {
  apiKey: "AIzaSyC9w0LoM4u0uW8WIkCvqTSJ45w7ln2a1jo",
  authDomain: "immediatemail-b8929.firebaseapp.com",
  databaseURL: "https://immediatemail-b8929.firebaseio.com",
  projectId: "immediatemail-b8929",
  storageBucket: "immediatemail-b8929.appspot.com",
  messagingSenderId: "764147957584",
  appId: "1:764147957584:web:7745fa8633ce2dcba9f655",
  measurementId: "G-9EJNXTM4DY"
};


const firebase = require('firebase');
firebase.initializeApp()


app.get('/mails', (request, response) => {
	admin
	.firestore()
	.collection('mails')
	.orderBy('createdAt', 'desc')
	.get()   
	.then((data) => {
	 	let mails = [];
	 	data.forEach((doc) => {
	 		mails.push({
	 			mailId: doc.id,
	 			body: doc.data().body,
	 			userHandle: doc.data().userHandle,
	 			createdAt: new Date().toISOString()
	 		});
	 	});
	 	return response.json(mails);
	 })
	 .catch(err => console.error(err));
})




app.post('/update', (request, response) => {
	
	const newMail = {
		body: request.body.body,
		userHandle: request.body.userHandle,
		createdAt: new Date().toISOString()
	};
	admin.firestore()
	     .collection('screams')
	     .add(newMail)
	     .then(doc => {
	     	response.json({message: `document ${doc.id} created successfully`});
	     })
	     .catch(err => {
	     	response.status(500).json({error: 'something went wrong'});
	     	console.error(err);
	     })
});

exports.api = functions.https.onRequest(app);




















