import { useState, useRef, useEffect } from 'react';

const ViewVent = () => {
  let s3_url = "https://anonyvent.s3.us-east-2.amazonaws.com/tempmp.mp3";

  const audioRef = useRef(new Audio(s3_url));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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
          setDuration(audio.duration);
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

  const handleAudioPlayPause = () => {
      const audio = audioRef.current;
      if (isPlaying) {
          audio.pause();
      } else {
          audio.play();
      }
      setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
      const audio = audioRef.current;
      const newTime = e.target.value;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
  };

  return (
      <div className="AudioFileListItem">
          <div className="AudioFileListElements">
              <a href="javascript:void(0);" onClick={handleAudioPlayPause}>
                  <span className="AudioFilePlayButton">
                      <box-icon name={isPlaying ? "pause-circle" : "play-circle"} color="#ffffff" size="sm"></box-icon>
                  </span>
                  <span>{isPlaying ? "Pause" : "Play"}</span>
              </a>
              <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  style={{ width: '100%' }}
              />
              <span>{Math.floor(currentTime)} / {Math.floor(duration)} sec</span>
          </div>
      </div>
  );

  };
  
  export default ViewVent;

