const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");
dotenv.config();

(async () => {
	const fetch = (await import("node-fetch")).default;
	global.fetch = fetch;

	const OpenAI = require("openai");
	const { AssemblyAI } = require("assemblyai");

	const OpenAIKey = process.env.OPENAI_KEY;
	const openai = new OpenAI({ apiKey: OpenAIKey });

	const app = express();
	const port = 8080;

	// Enable CORS
	app.use(cors());

	// Set up multer storage
	const storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, "uploads/");
		},
		filename: function (req, file, cb) {
			cb(
				null,
				file.fieldname + "-" + Date.now() + path.extname(file.originalname)
			);
		},
	});

	const upload = multer({
		storage: storage,
		fileFilter: function (req, file, cb) {
			const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/mpg"];
			if (!allowedTypes.includes(file.mimetype)) {
				return cb(new Error("Error: Only .mp3 files are allowed!"));
			}

			const extname = path.extname(file.originalname).toLowerCase();
			if (extname !== ".mp3") {
				return cb(new Error("Error: Only .mp3 files are allowed!"));
			}

			cb(null, true);
		},
	});

	// Create the uploads directory if it doesn't exist
	const dir = "./uploads";
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	// Configure AWS SDK
	AWS.config.update({
		accessKeyId: process.env.AWS_ACCESS,
		secretAccessKey: process.env.AWS_SECRET,
		region: "us-east-2",
	});

	const s3 = new AWS.S3();

	// MongoDB Connection URI
	const uri = process.env.CONNECTION_STR;
	const client = new MongoClient(uri);

	// Route to handle file upload and upload to S3
	app.post("/upload", upload.single("mp3file"), async (req, res) => {
		if (!req.file) {
			return res.status(400).send("No file uploaded.");
		}

		const recordingTime = req.body.recordingTime; // Extract recording time from request body
		console.log(`Recording Time: ${recordingTime} seconds`);

		const fileContent = fs.readFileSync(req.file.path);
		console.log(req.file.filename);
		console.log(req.body.title);
		const params = {
			Bucket: "anonyvent",
			Key: `${req.file.filename}`, // File name you want to save as in S3
			Body: fileContent,
			ContentType: req.file.mimetype,
			// ACL: "public-read", // File permissions
		};

		s3.upload(params, async (err, data) => {
			// Delete the local file after upload
			fs.unlink(req.file.path, (err) => {
				if (err) {
					console.error("Error deleting the file:", err);
					return res.status(500).send("Failed to delete local file.");
				}
			});

			if (err) {
				console.error("Error uploading file:", err);
				return res.status(500).send("Failed to upload file.");
			}

			let [flag, transcription] = await gptChecker(req.file.filename);

			if (flag === "false") {
				try {
					// Connect to MongoDB cluster
					await client.connect();
					const database = client.db("AnonyVent");
					// Access the collection
					const collection = database.collection("Vents");

					const record = {
						title: req.body.title,
						url: data.Location,
						transcription: transcription,
						length: recordingTime,
					};

					await collection.insertOne(record);
					res.send(
						`File uploaded successfully. Recording time: ${recordingTime} seconds. Record saved to MongoDB.`
					);
				} catch (e) {
					console.log(e);
					res.status(500).send("Failed to save record to MongoDB.");
				} finally {
					await client.close();
				}
			} else {
				res.send(
					`File contains flagged content and was not saved to MongoDB. Recording time: ${recordingTime} seconds.`
				);
			}
		});
	});

	// Start the server
	app.listen(port, () => {
		console.log(`Server running at http://localhost:${port}/`);
	});

	const ASSKEY = process.env.ASSEMBLY_KEY;
	const assemblyClient = new AssemblyAI({
		apiKey: ASSKEY,
	});

	const getTranscription = async (audioTitle) => {
		const audioUrl =
			"https://anonyvent.s3.us-east-2.amazonaws.com/" + audioTitle;

		const config = {
			audio_url: audioUrl,
		};
		const transcript = await assemblyClient.transcripts.transcribe(config);
		return transcript.text;
	};

	async function gptChecker(audioTitle) {
		const transcription = await getTranscription(audioTitle);
		console.log(transcription);
		const rules =
			"If the following transcription mentions sexual activities,or mentions hurting another lifeform return true otherwise return false: ";
		const prompt = rules.concat(transcription);
		const completion = await openai.completions.create({
			model: "gpt-3.5-turbo-instruct",
			prompt: prompt,
			max_tokens: 8,
			temperature: 0,
		});

		const redFlag = completion.choices[0].text.trim();
		console.log(redFlag);
		return [redFlag.toLowerCase(), transcription];
	}
})();
