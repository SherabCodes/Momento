/*
for server-side operations like adding data to firestore securely
*/
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin.json'); // Path to service account key

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "capstone-4b7c8.appspot.com"
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { db, bucket };
