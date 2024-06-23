import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import pauseImg from "../images/pause-button.png";

const RecordVent = () => {
	const [isRecording, setIsRecording] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [audioURL, setAudioURL] = useState("");
	const [audioBlob, setAudioBlob] = useState(null);
	const [recordingTime, setRecordingTime] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadingResponse, setUploadingResponse] = useState("");
	const [processing, setProcessing] = useState(false); // State for processing state
	const [title, setTitle] = useState(""); // State for recording title
	const [showResponse, setShowResponse] = useState(false); // State to show response message
	const mediaRecorderRef = useRef(null);
	const audioChunksRef = useRef([]);
	const timerRef = useRef(null);
	const finalRecordingTimeRef = useRef(0);

	useEffect(() => {
		// Clean up function for stopping audio when component unmounts
		return () => {
			if (audioURL) {
				URL.revokeObjectURL(audioURL); // Revoke the Object URL to stop audio
			}
		};
	}, [audioURL]);

	useEffect(() => {
		if (isRecording && recordingTime >= 180) {
			stopRecording();
		}
	}, [recordingTime]);

	const startRecording = async () => {
		try {
			if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				});
				mediaRecorderRef.current = new MediaRecorder(stream);

				mediaRecorderRef.current.ondataavailable = (event) => {
					if (event.data.size > 0) {
						audioChunksRef.current.push(event.data);
					}
				};

				mediaRecorderRef.current.onstop = () => {
					const audioBlob = new Blob(audioChunksRef.current, {
						type: "audio/mp3",
					});
					const audioUrl = URL.createObjectURL(audioBlob);
					setAudioURL(audioUrl);
					setAudioBlob(audioBlob);
					audioChunksRef.current = [];
					clearInterval(timerRef.current);
				};

				mediaRecorderRef.current.start();
				setIsRecording(true);
				setIsPaused(false);
				setRecordingTime(0); // Reset recording time
				startTimer();
			}
		} catch (error) {
			console.error("Error accessing microphone:", error);
		}
	};

	const startTimer = () => {
		timerRef.current = setInterval(() => {
			setRecordingTime((prevTime) => prevTime + 1);
		}, 1000);
	};

	const pauseRecording = () => {
		if (
			mediaRecorderRef.current &&
			mediaRecorderRef.current.state === "recording"
		) {
			mediaRecorderRef.current.pause();
			setIsPaused(true);
			clearInterval(timerRef.current);
		}
	};

	const resumeRecording = () => {
		if (
			mediaRecorderRef.current &&
			mediaRecorderRef.current.state === "paused"
		) {
			mediaRecorderRef.current.resume();
			setIsPaused(false);
			startTimer();
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			setIsPaused(false);
			clearInterval(timerRef.current);
			finalRecordingTimeRef.current = recordingTime; // Store the final recording time
		}
	};

	const uploadAudio = async () => {
		if (audioBlob && title.trim() !== "") {
			// Check if title is not empty
			setProcessing(true); // Start processing state
			const formData = new FormData();
			formData.append("mp3file", audioBlob, "recording.mp3");
			formData.append("recordingTime", finalRecordingTimeRef.current);
			formData.append("title", title); // Append title to FormData

			try {
				const response = await axios.post(
					"http://localhost:8080/upload",
					formData,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					}
				);

				setUploadingResponse("File uploaded successfully");
				console.log("File uploaded successfully:", response.data);
				setAudioURL("");
				setAudioBlob(null);
				setProcessing(false); // End processing state
				setShowResponse(true); // Show the response message
			} catch (error) {
				console.error("Error uploading file:", error);
				setProcessing(false); // End processing state on error
			}

			setTimeout(() => {
				setShowResponse(false); // Clear response after 7 seconds
			}, 7000);
		}
	};

	return (
		<div>
			<h1>Audio Recorder</h1>
			<button onClick={startRecording} disabled={isRecording}>
				{" "}
				Start Recording
			</button>
			<button onClick={pauseRecording} disabled={!isRecording || isPaused}>
				Pause
			</button>
			<button onClick={resumeRecording} disabled={!isRecording || !isPaused}>
				Resume Recording
			</button>
			<button onClick={stopRecording} disabled={!isRecording}>
				Stop Recording
			</button>
			{audioURL && (
				<div>
					<h2>Preview</h2>
					<audio controls src={audioURL}></audio>
					<input
						type="text"
						placeholder="Enter recording title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
					<button onClick={uploadAudio} disabled={isUploading || processing}>
						{processing ? "Processing..." : "Upload Recording"}
					</button>
					{showResponse && <p>{uploadingResponse}</p>}
				</div>
			)}
			<p>
				Recording Time: {Math.floor(recordingTime / 60)}:
				{("0" + (recordingTime % 60)).slice(-2)} (Max: 3:00)
			</p>
		</div>
	);
};

export default RecordVent;
