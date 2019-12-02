const functions = require('firebase-functions');

// const admin = require('firebase-admin');

// admin.initializeApp();

const admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://immediatemail-b8929.firebaseio.com"
});

const express = require('express')
const app = express();

const firebaseConfig = {
  apiKey: "AIzaSyC9w0LoM4u0uW8WIkCvqTSJ45w7ln2a1jo",
  authDomain: "immediatemail-b8929.firebaseapp.com",
  databaseURL: "https://immediatemail-b8929.firebaseio.com",
  projectId: "immediatemail-b8929",
  storageBucket: "immediatemail-b8929.appspot.com",
  messagingSenderId: "764147957584",
  appId: "1:764147957584:web:7745fa8633ce2dcba9f655",
  measurementId: "G-9EJNXTM4DY"
}


const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();


app.get('/mails', (request, response) => {
	db
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
const FBAuth = (request, response, next) => {
	let idToken;
	if (request.headers.authorization && request.headers.authorization.startWith('Bearer ')) {
		idToken = request.headers.authorization = split('Bearer ')[1];
	} else {
		console.error('No token found')
		return response.status(403).json({ error: 'unathorized'})
	}

	admin.auth().verifyIdToken(idToken)
	.then(decodedToken => {
		request.user = decodedToken;
		console.log(decodedToken);
		return db.collection('users')
		  .where('userId', '==', request.user.uid)
		  .limit(1)
		  .get();
	})
	.then(data => {
		request.user.handle = data.docs[0].data().handle;
		return next();
	})
	.catch(err => {
		console.error('Error while verifying token', err);
		return response.status(403).json(err);
	})
}

//post update
app.post('/update', FBAuth, (request, response) => {
	if (request.body.body.trim()==='') {
		return response.status(400).json({ body: "Body must not be empty"});
	}
	
	const newMail = {
		body: request.body.body,
		userHandle: request.user.handle,
		createdAt: new Date().toISOString()
	};
	     db
	     .collection('mails')
	     .add(newMail)
	     .then(doc => {
	     	response.json({message: `document ${doc.id} created successfully`});
	     })
	     .catch(err => {
	     	response.status(500).json({error: 'something went wrong'});
	     	console.error(err);
	     })
});
const isEmail = (email) => {
	const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (email.match(regEx)) return true;
	else return false;
}

const isEmpty = (string) => {
	if (string.trim() === '') return true;
	else return false;
}
//SignUproute

app.post('/signup', (request, response)=> {
	const newUser = {
		email: request.body.email,
	    password: request.body.password,
	    confirmPassword: request.body.confirmPassword,
	    handle: request.body.handle,
	}
	let errors = {};

	if (isEmpty(newUser.email)) {
		errors.email = 'Must not be empty'
	} else if (!isEmail(newUser.email)){
		errors.email = 'Must be a valid email address'
	}

	if (isEmpty(newUser.password)) errors.password = 'Must not be empty'
	if (newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match';
	if (isEmpty(newUser.handle)) errors.handle = 'Must not be empty';

	if (Object.keys(errors).length > 0) return response.status(400).json(errors);


	
	//validate data
	let token;
	let userId;

	db.doc(`/users/${newUser.handle}`).get()
	   .then(doc => {
	   	if (doc.exists){
	   		return response.status(400).json({handle: 'this handle is already taken'})
        } else {
	   		return firebase
	   		   .auth()
	   		   .createUserWithEmailAndPassword(newUser.email, newUser.password);
	       }
	   })
	   	.then((data) => {
	   		userId = data.user.uid;
	   		return data.user.getIdToken();
	   	})
	   	.then((idToken) => {
	   		token =  idToken;
	   		const userCredentials = {
	   			handle: newUser.handle,
	   			email: newUser.email,
	   			createdAt: new Date().toISOString(),
	   			userId
	   		};
	   		return db.doc(`/users/${newUser.handle}`).set(userCredentials);
	   	})
	   	.then(() => {
	   		return response.status(201).json({ token });
	   	})
	   	.catch((err) => {
	   		console.error(err);
	   		if (err.code === 'auth/email-already-in-use'){
	   			return response.status(400).json({ email: 'Email is already in use'})
	   		} else {
	   			return response.status(500).json({ error: err.code})
	   	   }
	   	})
});

app.post('/login', (request, response) => {
	const user = {
		email: request.body.email,
		password: request.body.password
	};

	let errors = {};

	if (isEmpty(user.email)) errors.email = "Must not be empty";
	if (isEmpty(user.password)) errors.password = "Must not be empty";

	if (Object.keys(errors).length > 0) return response.status(400).json(errors);

	firebase
	 .auth()
	 .signInWithEmailAndPassword(user.email, user.password)
	 .then(data => {
	 	return data.user.getIdToken();
	 })
	 .then(token => {
	 	return response.json({token});
	 })
	 .catch(err => {
	 	console.error(err);
	 	if (err.code === 'auth/wrong-password'){
	 		return response
	 		.status(403)
	 		.json({ general: 'Wrong credentials, please try again'});
	 	} else 
	 	return response.status(500).json({ error: err.code });
	 })

})

exports.api = functions.https.onRequest(app);




















