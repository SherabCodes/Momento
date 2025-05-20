// backend/server.js
/*
This file uploads the image to cloud storage and saves the url and text to Firestore.
It sends success or failure message to the frontend
*/

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { db, bucket } = require('./firebaseConfig');

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory for processing

// Enable CORS for all origins
app.use(cors());

// Simple GET endpoint for health check
app.get('/', (req, res) => {
    res.send('Welcome!'); // Simple response for GET /
});

// POST endpoint for uploading images
app.post('/upload', upload.single('image'), async (req, res) => {
    const { text } = req.body; // Optional text input
    const image = req.file; // The uploaded file

    // Check if an image was uploaded
    if (!image) {
        return res.status(400).send('No image uploaded.'); // 400 Bad Request
    }

    try {
        // Create a blob for the uploaded image
        const blob = bucket.file(image.originalname);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: image.mimetype, // Set content type of the image
            },
        });

        // Handle any error during the upload process
        blobStream.on('error', (error) => {
            console.error('Error uploading to storage:', error);
            return res.status(500).send('Error uploading image.'); // 500 Internal Server Error
        });

        // Handle successful upload
        blobStream.on('finish', async () => {
            // Construct the image URL
            const imageUrl = `https://storage.googleapis.com/${bucket.name}/${image.originalname}`;

            // Store the text and image URL in Firestore
            await db.collection('memories').add({ text, imageUrl });
            res.status(200).send('Upload successful.'); // 200 OK
        });

        // End the stream with the image buffer
        blobStream.end(image.buffer); 
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).send('Error processing upload.'); // 500 Internal Server Error
    }
});

// Set the server to listen on port 5003
const PORT = 5004;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
