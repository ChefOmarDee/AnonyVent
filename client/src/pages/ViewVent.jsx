import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
	useMemo,
} from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "./UserContext";
import "./ViewVent.css";
import tapeRecorder from "../images/tape-recorder-gif.gif";
import playButton from "../images/play-button.png"
import pauseButton from "../images/pause-button.png";

const ViewVent = () => {
	let { userId } = useParams();
	const { value } = useContext(UserContext);

	const [state, setState] = useState({
		s3_url: "",
		title: "",
		transcription: "",
		isPlaying: false,
		currentTime: 0,
		isLoading: true,
		hasDuration: false,
		duration: 0,
	});

	const audioRef = useRef(new Audio(state.s3_url));

	const handleStateUpdate = (updates) => {
		setState((prevState) => ({ ...prevState, ...updates }));
	};

	useEffect(() => {
		if (value && value.docs) {
			console.log(value);
			const foundItem = value.docs.find((doc) => doc._id === userId);
			if (foundItem) {
				handleStateUpdate({
					s3_url: foundItem.url,
					title: foundItem.title,
					transcription: foundItem.transcription,
					duration: parseInt(foundItem.length, 10),
					isLoading: false,
				});
			}
		}
	}, [value, userId]);

	useEffect(() => {
		const audio = audioRef.current;
		if (state.s3_url) {
			audio.src = state.s3_url;
		}

		const handleEnded = () => {
			handleStateUpdate({ isPlaying: false, currentTime: 0 });
		};

		const handleTimeUpdate = () => {
			handleStateUpdate({ currentTime: audio.currentTime });
		};

		const handleLoadedMetadata = () => {
			const audioDuration = state.duration || audio.duration;
			if (!isNaN(audioDuration) && audioDuration > 0) {
				handleStateUpdate({
					hasDuration: true,
					duration: audioDuration,
				});
			}
			handleStateUpdate({ isLoading: false });
		};

		audio.addEventListener("ended", handleEnded);
		audio.addEventListener("timeupdate", handleTimeUpdate);
		audio.addEventListener("loadedmetadata", handleLoadedMetadata);

		return () => {
			audio.removeEventListener("ended", handleEnded);
			audio.removeEventListener("timeupdate", handleTimeUpdate);
			audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
		};
	}, [state.s3_url, state.duration]);

	const handleAudioPlayPause = useCallback(() => {
		const audio = audioRef.current;
		if (state.isPlaying) {
			audio.pause();
		} else {
			audio.play();
		}
		handleStateUpdate({ isPlaying: !state.isPlaying });
	}, [state.isPlaying]);

	const handleSeek = useCallback(
		(e) => {
			const audio = audioRef.current;
			const scrollValue = e.target.value;
			const newTime = (scrollValue / 100) * state.duration;
			audio.currentTime = newTime;
			handleStateUpdate({ currentTime: newTime });
		},
		[state.duration]
	);

	return (
		<div className="AudioFileListItem">
  <div className="inside-boxes" id="left-box"> 
    <div className="AudioFileListElements">
      <img src={tapeRecorder} alt=""></img>
      <h1>{state.title}</h1>
      <div className="audio-controls">
        <button className="playPause" onClick={handleAudioPlayPause}>
          <img src={state.isPlaying ? pauseButton : playButton} alt={state.isPlaying ? "Pause" : "Play"} />
        </button>
        <div className="playback-container">
          <input
            type="range"
            min="0"
            max="100"
            value={(state.currentTime / state.duration) * 100}
            onChange={handleSeek}
            disabled={state.isLoading || !state.hasDuration}
          />
          <span>
            {state.isLoading
              ? "Loading..."
              : state.hasDuration
              ? `${Math.floor(state.currentTime)} / ${Math.floor(
                  state.duration
              )} sec`
              : "Duration unavailable"}
          </span>
        </div>
      </div>
    </div>
  </div>
  <div className="inside-boxes" id="right-box">
    {state.transcription}
  </div>
</div>
	);
};

export default ViewVent;
