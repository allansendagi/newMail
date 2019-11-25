const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const app = express();


app.get('/mails', (request, response) => {
	admin
	.firestore()
	.collection('mails')
	.get()   
	.then((data) => {
	 	let mails = [];
	 	data.forEach((doc) => {
	 		mails.push(doc.data());
	 	});
	 	return response.json(mails);
	 })
	 .catch(err => console.error(err));
})




app.post('/update', (request, response) => {
	
	const newMail = {
		body: request.body.userHandle,
		createdAt: admin.firestore.Timestamp.fromDate(new Date())
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




















