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
			<div className="AudioFileListElements">
				<h1>{state.title}</h1>
				<button onClick={handleAudioPlayPause}>
					<span className="AudioFilePlayButton">
						<box-icon
							name={state.isPlaying ? "pause-circle" : "play-circle"}
							color="#ffffff"
							size="sm"
						></box-icon>
					</span>
					<span>{state.isPlaying ? "Pause" : "Play"}</span>
				</button>
				<input
					type="range"
					min="0"
					max="100"
					value={(state.currentTime / state.duration) * 100}
					onChange={handleSeek}
					style={{ width: "50%" }}
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
				<p>{state.transcription}</p>
			</div>
		</div>
	);
};

export default ViewVent;
