const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv").config();
const { MongoClient } = require('mongodb');
// MongoDB connection string
const uri = process.env.CONNECTION_STR; 
const client = new MongoClient(uri);

const app = express();
const port = 8080;

// Enable CORS
app.use(cors());

// Set up multer storage
// const storage = multer.diskStorage({
// 	destination: function (req, file, cb) {
// 		cb(null, "uploads/");
// 	},
// 	filename: function (req, file, cb) {
// 		cb(
// 			null,
// 			file.fieldname + "-" + Date.now() + path.extname(file.originalname)
// 		);
// 	},
// });

// const upload = multer({
// 	storage: storage,
// 	fileFilter: function (req, file, cb) {
// 		const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/mpg"];
// 		if (!allowedTypes.includes(file.mimetype)) {
// 			return cb("Error: Only .mp3 files are allowed!");
// 		}

// 		const extname = path.extname(file.originalname).toLowerCase();
// 		if (extname !== ".mp3") {
// 			return cb("Error: Only .mp3 files are allowed!");
// 		}

// 		cb(null, true);
// 	},
// });

// // Create the uploads directory if it doesn't exist
// const dir = "./uploads";
// if (!fs.existsSync(dir)) {
// 	fs.mkdirSync(dir);
// }

// // Configure AWS SDK
// AWS.config.update({
// 	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
// 	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// 	region: process.env.AWS_REGION,
// });

// const s3 = new AWS.S3();

// // Route to handle file upload and upload to S3
// app.post("/upload", upload.single("mp3file"), (req, res) => {
// 	if (!req.file) {
// 		return res.status(400).send("No file uploaded.");
// 	}

// 	const recordingTime = req.body.recordingTime; // Extract recording time from request body
// 	console.log(`Recording Time: ${recordingTime} seconds`);

// 	const fileContent = fs.readFileSync(req.file.path);
// 	// const params = {
// 	//     Bucket: process.env.S3_BUCKET_NAME,
// 	//     Key: `uploads/${req.file.filename}`, // File name you want to save as in S3
// 	//     Body: fileContent,
// 	//     ContentType: req.file.mimetype,
// 	//     ACL: 'public-read' // File permissions
// 	// };

// 	// s3.upload(params, (err, data) => {
// 	//     // Delete the local file after upload
// 	//     fs.unlink(req.file.path, (err) => {
// 	//         if (err) {
// 	//             console.error('Error deleting the file:', err);
// 	//             return res.status(500).send('Failed to delete local file.');
// 	//         }
// 	//     });

// 	//     if (err) {
// 	//         console.error('Error uploading file:', err);
// 	//         return res.status(500).send('Failed to upload file.');
// 	//     }

// 	res.send(
// 		`File uploaded successfully. Recording time: ${recordingTime} seconds`
// 	);
// 	// });
// });

async function main() {
  try {
    // Connect to MongoDB cluster
    await client.connect();
    const database = client.db('AnonyVent');
    // Access the collection
    const collection = database.collection('Vents');
    const randomDocuments = await collection.aggregate([{ $sample: { size: 3 } }]).toArray();
    //const titles = randomDocuments.map(doc => doc.title);
	//console.log(titles);
	console.log(randomDocuments);
    return randomDocuments;
  } catch (e) {
    console.log(e);
    throw e; // Re-throw the error to be caught by the caller
  } finally {
    await client.close();
  }
}
main().then(() => {
	console.log('main function completed');
  }).catch(error => {
	console.error('Error in main function:', error);
  });
app.get('/get', async (req, res) => {
  try {
    const docs = await main();
	//const titles = ["hello", "yappa", "hey"];
	//console.log(titles);
	//const hello = "hello";
    res.json(docs); // Send the titles as JSON response
  } catch (e) {
    console.error('Error fetching titles from MongoDB:', e);
    res.status(500).json({ error: 'Internal Server Error' }); // Send an error response
  }
});
// Start the server
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}/`);
});

