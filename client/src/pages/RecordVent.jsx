import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const RecordVent = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [audioURL, setAudioURL] = useState('');
    const [audioBlob, setAudioBlob] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const finalRecordingTimeRef = useRef(0);

    useEffect(() => {
        if (isRecording && recordingTime >= 180) {
            stopRecording();
        }
    }, [recordingTime]);

    const startRecording = async () => {
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);

                mediaRecorderRef.current.ondataavailable = event => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setAudioURL(audioUrl);
                    setAudioBlob(audioBlob);
                    audioChunksRef.current = [];
                    clearInterval(timerRef.current);
                };

                mediaRecorderRef.current.start();
                setIsRecording(true);
                setIsPaused(false);
                startTimer();
            }
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setRecordingTime(prevTime => prevTime + 1);
        }, 1000);
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            clearInterval(timerRef.current);
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
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
            console.log('Final recording time:', finalRecordingTimeRef.current); // Debugging
        }
    };

    const uploadAudio = async () => {
        if (audioBlob) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('mp3file', audioBlob, 'recording.mp3');
            formData.append('recordingTime', finalRecordingTimeRef.current); // Use the stored final recording time

            try {
                const response = await axios.post('http://localhost:8080/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                console.log('File uploaded successfully:', response.data);
                console.log('Uploaded recording time:', finalRecordingTimeRef.current); // Debugging
                setAudioURL('');
                setAudioBlob(null);
                setIsUploading(false);
            } catch (error) {
                console.error('Error uploading file:', error);
                setIsUploading(false);
            }
        }
    };

    return (
        <div>
            <h1>Audio Recorder</h1>
            <button onClick={startRecording} disabled={isRecording}>Start Recording</button>
            <button onClick={pauseRecording} disabled={!isRecording || isPaused}>Pause Recording</button>
            <button onClick={resumeRecording} disabled={!isRecording || !isPaused}>Resume Recording</button>
            <button onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>
            {audioURL && (
                <div>
                    <h2>Preview</h2>
                    <audio controls src={audioURL}></audio>
                    <button onClick={uploadAudio} disabled={isUploading}>Upload Recording</button>
                </div>
            )}
            <p>Recording Time: {Math.floor(recordingTime / 60)}:{('0' + (recordingTime % 60)).slice(-2)} (Max: 3:00)</p>
        </div>
    );
};

export default RecordVent;
