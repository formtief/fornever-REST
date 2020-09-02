const admin = require('firebase-admin');
const serviceAccount = require('./key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://frnvrde.firebaseio.com',
});

const db = admin.firestore();

const rtdb = admin.database();

module.exports = { admin, db, rtdb };
