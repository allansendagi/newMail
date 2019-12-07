const admin = require("firebase-admin");

var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://immediatemail-b8929.firebaseio.com",
  storageBucket: "immediatemail-b8929.appspot.com"

});



const db = admin.firestore();

module.exports = { admin, db };