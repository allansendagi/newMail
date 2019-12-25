const { db } = require("../util/admin");

exports.getAllMails = (request, response) => {
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
}

exports.postOneMail = (request, response) => {
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
}
//Fetch one scream
exports.getMail = (request, response) => {
	   let mailData = {};
	db.doc(`/mails/${request.params.mailId}`)
	  .get()
	  .then((doc) => {
	  	if(!doc.exists) {
	  		return response.status(404).json({ error: 'Mail not found'});
	  	} 
	  	mailData = doc.data();
	  	mailData.mailId = doc.id;
	  	return db
	  	  .collection('comments')
	  	  .orderBy('createdAt', 'desc')
	  	  .where('mailId', '==', request.params.mailId)
	  	  .get();
	     })
	  .then((data) => {
	  	mailData.comments = [];
	  	data.forEach((doc) => {
	  		mailData.comments.push(doc.data());
	  	})
	  	return response.json(mailData);
	  })
	  .catch((err) => {
	  	console.error(err);
	  	response.status(500).json({ error: err.code })
	  })
  }
  //comment on a comment.
  exports.commentOnMail = (request, response) => {
  	if (request.body.body.trim() === '') 
  		 return response.status(400).json({ comment: 'Must not be empty'})

  		const newComment = {
  			body: request.body.body,
  			createdAt: new Date().toISOString(),
  			mailId: request.params.mailId,
  			userHandle: request.user.handle,
  			userImage: request.user.imageUrl
  		};
  	db.doc(`/mails/${request.params.mails}`)
  	 .get()
  		.then(doc => {
  			if(!doc.exists) {
  				return res.status(404).json({ error: 'mail not found'});
  			}
  			return db.collection('comments').add(newComment);
  		})
  		.then(() => {
  			response.json(newComment)
  		})
  		.catch(err => {
  			console.log(err);
  			response.status(500).json({ error: 'something went wrong'});
  		})
  }



 