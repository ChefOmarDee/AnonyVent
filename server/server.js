const express = require('express');
const multer = require('multer');
// const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
// require('dotenv').config();

const app = express();
const port = 8080;

// Enable CORS
app.use(cors());

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/mpg'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb('Error: Only .mp3 files are allowed!');
        }

        const extname = path.extname(file.originalname).toLowerCase();
        if (extname !== '.mp3') {
            return cb('Error: Only .mp3 files are allowed!');
        }

        cb(null, true);
    }
});

// Create the uploads directory if it doesn't exist
const dir = './uploads';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

// Configure AWS SDK
// AWS.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: process.env.AWS_REGION
// });

// const s3 = new AWS.S3();

// Route to handle file upload and upload to S3
app.post('/upload', upload.single('mp3file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const fileContent = fs.readFileSync(req.file.path);
    // const params = {
    //     Bucket: process.env.S3_BUCKET_NAME,
    //     Key: `uploads/${req.file.filename}`, // File name you want to save as in S3
    //     Body: fileContent,
    //     ContentType: req.file.mimetype,
    //     ACL: 'public-read' // File permissions
    // };

    // s3.upload(params, (err, data) => {
    //     // Delete the local file after upload
    //     fs.unlink(req.file.path, (err) => {
    //         if (err) {
    //             console.error('Error deleting the file:', err);
    //             return res.status(500).send('Failed to delete local file.');
    //         }
    //     });

    //     if (err) {
    //         console.error('Error uploading file:', err);
    //         return res.status(500).send('Failed to upload file.');
    //     }

        res.send(`File uploaded successfully. `);
    // });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
