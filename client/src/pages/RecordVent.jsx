import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import pauseImg from "../images/pause-button.png";
import micImg from "../images/mic-button.png";
import stopImg from "../images/stop-button.png";
import resumeImg from "../images/play-button.png";
import "./RecordVent.css";

const RecordVent = () => {
	const [isRecording, setIsRecording] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [audioURL, setAudioURL] = useState("");
	const [audioBlob, setAudioBlob] = useState(null);
	const [recordingTime, setRecordingTime] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [processing, setProcessing] = useState(false);
	const [title, setTitle] = useState("");
	const mediaRecorderRef = useRef(null);
	const audioChunksRef = useRef([]);
	const timerRef = useRef(null);
	const finalRecordingTimeRef = useRef(0);
	const navigate = useNavigate();

	useEffect(() => {
		startRecording();
		return () => {
			if (audioURL) {
				URL.revokeObjectURL(audioURL);
			}
		};
	}, []);

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
				setRecordingTime(0);
				setAudioURL("");
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
			finalRecordingTimeRef.current = recordingTime;
		}
	};

	const uploadAudio = async () => {
		if (audioBlob && title.trim() !== "") {
			setProcessing(true);
			const formData = new FormData();
			formData.append("mp3file", audioBlob, "recording.mp3");
			formData.append("recordingTime", finalRecordingTimeRef.current);
			formData.append("title", title);

			const deviceType = /iPhone|iPad|iPod/.test(navigator.userAgent)
				? "iOS"
				: "other";
			formData.append("deviceType", deviceType);

			try {
				const response = await axios.post(
					"https://anonyvent-heroku-817f10d16a98.herokuapp.com/upload",
					formData,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					}
				);

				console.log(response.data);
				if (!response.data.includes("flagged")) {
					navigate("/", {
						state: {
							uploadStatus: "Recording successfully uploaded",
						},
					});
				} else {
					navigate("/", {
						state: {
							uploadStatus:
								"Recording upload failed due to containing flagged content",
						},
					});
				}
			} catch (error) {
				console.error("Error uploading file:", error);
			} finally {
				setProcessing(false);
			}
		}
	};

	return (
		<div className="container">
			{isRecording && <p className="vent-message">Vent,</p>}
			{(isRecording || audioURL) && (
				<div>
					{isRecording && (
						<div className="recording-controls">
							<button
								className="pause-resume-button"
								onClick={isPaused ? resumeRecording : pauseRecording}
							>
								<img
									src={isPaused ? resumeImg : pauseImg}
									alt={isPaused ? "Resume Recording" : "Pause Recording"}
								/>
							</button>
							<div className="button-spacer"></div>
							<button className="stop-button" onClick={stopRecording}>
								<img src={stopImg} alt="Stop Recording" />
							</button>
							<div className="button-spacer"></div>
							<p className="recording-time">
								{Math.floor(recordingTime / 60)}:
								{("0" + (recordingTime % 60)).slice(-2)}
							</p>
						</div>
					)}

					{audioURL && (
						<>
							<div className="preview">
								<div className="preview-text-container">
									<p className="Preview-Text">Let Go.</p>
								</div>
								<input
									type="text"
									className="title-input"
									placeholder="Enter recording title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
								/>
								<br />
								<br />
								<audio controls src={audioURL}></audio>
								<br />
								<br />
								<div className="preview-buttons">
									<button
										className="new-recording-button"
										onClick={startRecording}
										disabled={isRecording}
									>
										New Recording
									</button>
									<button
										className="submit-recording-button"
										onClick={uploadAudio}
										disabled={isUploading || processing}
									>
										{processing ? "Processing..." : "Upload Recording"}
									</button>
								</div>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default RecordVent;
