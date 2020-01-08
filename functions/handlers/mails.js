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
	 			createdAt: doc.data().createdAt,
        commentCount:doc.data().commentCount,
        likeCount:doc.data().likeCount,
        userImage:doc.data().userImage
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
		userImage: request.user.imageUrl,
		createdAt: new Date().toISOString(),
		likeCount: 0,
		commentCount: 0
	};
	     db.collection('mails')
	     .add(newMail)
	     .then((doc) => {
	     	const resMail = newMail;
	     	resMail.mailId = doc.id;
 	     	response.json(resMail);
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
  	db.doc(`/mails/${request.params.mailId}`)
  	 .get()
  		.then((doc) => {
  			if(!doc.exists) {
  				return res.status(404).json({ error: 'mail not found'});
  			}
        return doc.ref.update({ commentCount: doc.data().commentCount + 1});
  		})
      .then(() => {
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
  //like
  exports.likeMail = (request, response) => {
  	const likeDocument = db.collection('likes').where('userHandle', '==', request.user.handle)
  	.where('mailId', '==', request.params.mailId).limit(1);

  	const mailDocument = db.doc(`/mails/${request.params.mailId}`);

  	let mailData;

  	mailDocument.get()
  	 .then(doc => {
  	 	if (doc.exists){
  	 		mailData = doc.data();
  	 		mailData.mailId = doc.id;
  	 		return likeDocument.get();
  	 	} else {
  	 		return response.status(404).json({ error: 'mail not found'});
  	 	}
  	 })
  	 .then(data => {
  	 	if (data.empty){
  	 		return db.collection('likes').add({
  	 			mailId: request.params.mailId,
  	 			userHandle: request.user.handle
  	 		})
  	 		.then(() => {
  	 			mailData.likeCount++
  	 			return mailDocument.update({ likeCount: mailData.likeCount})
  	 		})
  	 		.then(() => {
  	 			return response.json(mailData);
  	 		})
  	 	} else {
  	 		return response.status(400).json({ error: 'mail already liked'});
  	 	}
  	 })
  	 .catch(err => {
      console.error(err)
  	 	response.status(500).json({ error: err.code});
  	 })
  }

  exports.unlikeMail = (request, response) => {
  	const likeDocument = db.collection('likes').where('userHandle', '==', request.user.handle)
    .where('mailId', '==', request.params.mailId).limit(1);

    const mailDocument = db.doc(`/mails/${request.params.mailId}`);

    let mailData;

    mailDocument.get()
     .then(doc => {
      if (doc.exists){
        mailData = doc.data();
        mailData.mailId = doc.id;
        return likeDocument.get();
      } else {
        return response.status(404).json({ error: 'mail not found'});
      }
     })
     .then((data) => {
      if (data.empty){
        return response.status(400).json({ error: 'mail not liked'}); 
      } else {
        return db
        .doc(`/likes/${data.docs[0].id}`)
        .delete()
        .then(() => {
          mailData.likeCount--;
          return mailDocument.update({ likeCount: mailData.likeCount})
        })
        .then(() => {
          response.json(mailData)
        })
      }
     })
     .catch(err => {
      console.error(err)
      response.status(500).json({ error: err.code});
     })
  };

  //delete mail
  exports.deleteMail = (request, response)=> {
    const document = db.doc(`/mails/${request.params.mailId}`);
    document.get()
        .then(doc => {
          if (!doc.exists) {
            return response.status(404).json({ error: 'Mail not found'});
          }
          if (doc.data().userHandle !== request.user.handle){
            return response.status(403).json({ error: 'Unauthorized'});
          } else {
            return document.delete();
          }
        })
        .then(() => {
          response.json({ message: 'mail deleted successfully'});
        }) 
        .catch(err => {
          console.error(err);
          return response.status(500).json({ error: err.code })
        })
  }











 