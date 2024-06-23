import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState
} from "react";
import { useParams } from 'react-router-dom';
import { UserContext } from "./UserContext";
import "./ViewVent.css";

const ViewVent = () => {
    let { userId } = useParams();

    const { value } = useContext(UserContext);
    
    const [s3_url, setS3Url] = useState("");
    const [title, setTitle] = useState("");
    const [transcription, setTranscription] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasDuration, setHasDuration] = useState(false);
    const [duration, setDuration] = useState(2);

    useEffect(() => {
        if (value && value.docs) {
            const foundItem = value.docs.find(doc => doc._id === userId);
            if (foundItem) {
                setS3Url(foundItem.url);
                setTitle(foundItem.title);
                setTranscription(foundItem.transcription);
                setDuration(parseInt(foundItem.length, 10));
            }
        }
    }, [value, userId]);

    const audioRef = useRef(new Audio(s3_url));

    useEffect(() => {
        if (s3_url) {
            audioRef.current.src = s3_url;
        }

        const audio = audioRef.current;

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleLoadedMetadata = () => {
            const audioDuration = duration || audio.duration;
            if (!isNaN(audioDuration) && audioDuration > 0) {
                setHasDuration(true);
                setDuration(audioDuration);
            }
            setIsLoading(false);
        };

        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);

        return () => {
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
    }, [s3_url, duration]);

    const handleAudioPlayPause = useCallback(() => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    const handleSeek = useCallback(
        (e) => {
            const audio = audioRef.current;
            const scrollValue = e.target.value;
            const newTime = (scrollValue / 100) * duration;
            audio.currentTime = newTime;
            setCurrentTime(newTime);
        },
        [duration]
    );

    return (
        <div className="AudioFileListItem">
            <div className="AudioFileListElements">
                <h1>{title}</h1>
                <button onClick={handleAudioPlayPause}>
                    <span className="AudioFilePlayButton">
                        <box-icon
                            name={isPlaying ? "pause-circle" : "play-circle"}
                            color="#ffffff"
                            size="sm"
                        ></box-icon>
                    </span>
                    <span>{isPlaying ? "Pause" : "Play"}</span>
                </button>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={(currentTime / duration) * 100}
                    onChange={handleSeek}
                    style={{ width: "50%" }}
                    disabled={isLoading || !hasDuration}
                />
                <span>
                    {isLoading
                        ? "Loading..."
                        : hasDuration
                        ? `${Math.floor(currentTime)} / ${Math.floor(duration)} sec`
                        : "Duration unavailable"}
                </span>
                <p>{transcription}</p>
            </div>
        </div>
    );
};

export default ViewVent;
