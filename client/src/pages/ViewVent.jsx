import { useState, useRef, useEffect, useContext, useCallback, useMemo } from 'react';
import { UserContext } from './UserContext';

const propDuration = 30;

const ViewVent = () => {
    const { value } = useContext(UserContext); // Remove setValue since it's not used
    
    useEffect(() => {
        console.log(value); // Log the context value only when it changes
    }, [value]);

    const s3_url = useMemo(() => "https://anonyvent.s3.us-east-2.amazonaws.com/mp3file-1719100814230.mp3", []);
    const audioRef = useRef(new Audio(s3_url));
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasDuration, setHasDuration] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleLoadedMetadata = () => {
            const duration = propDuration || audio.duration;
            if (!isNaN(duration) && duration > 0) {
                setHasDuration(true);
            }
            setIsLoading(false);
        };

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, []);

    const handleAudioPlayPause = useCallback(() => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    const handleSeek = useCallback((e) => {
        const audio = audioRef.current;
        const newTime = e.target.value;
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    }, []);

    const displayedDuration = useMemo(() => propDuration, []);

    return (
        <div className="AudioFileListItem">
            <div className="AudioFileListElements">
                <button onClick={handleAudioPlayPause}>
                    <span className="AudioFilePlayButton">
                        <box-icon name={isPlaying ? "pause-circle" : "play-circle"} color="#ffffff" size="sm"></box-icon>
                    </span>
                    <span>{isPlaying ? "Pause" : "Play"}</span>
                </button>
                <input
                    type="range"
                    min="0"
                    max={displayedDuration}
                    value={currentTime}
                    onChange={handleSeek}
                    style={{ width: '100%' }}
                    disabled={isLoading || !hasDuration}
                />
                <span>
                    {isLoading ? 'Loading...' : (hasDuration ? `${Math.floor(currentTime)} / ${Math.floor(displayedDuration)} sec` : 'Duration unavailable')}
                </span>
            </div>
        </div>
    );
};

export default ViewVent;
