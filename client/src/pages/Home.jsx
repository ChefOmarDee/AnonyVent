import tapeImg from "../images/retro-tape-icon.png";
import micImg from "../images/mic-1-removebg-preview (1).png";
import { Link } from "react-router-dom";
import { useEffect } from 'react';
import {main} from "./carolinaServer";
import './Home.css';

const Home = () => {
  //useEffect
  useEffect(() => {
    // Your function here
    main();
    console.log('Page has loaded');
    
    // Optionally, you can return a cleanup function here
    return () => {
      // Cleanup code if needed
    };
  }, []); 
  return (
    <>
      <main>
      <div id="tapes-container">
          <div id="tapes" style={{ position: 'relative' }}>
            <div className="tape">
              <img className="tapeDisappear" src={tapeImg} alt="tape1" width="250" height="250" />
              <div className="tape-text">afasdf</div>
            </div>
            <div className="tape">
              <img className="tapeDisappear" src={tapeImg} alt="tape2" width="250" height="250" />
              <div className="tape-text">afasdf</div>
            </div>
            <div className="tape">
              <img className="tapeDisappear" src={tapeImg} alt="tape3" width="250" height="250" />
              <div className="tape-text">afasdf</div>
            </div>
          </div>
          <Link to="/recordvent">
          <div id="record-button" >
            <img src={micImg} alt="mic-image"/>
          </div>
          </Link>
        </div>

      </main>
    </>
  )
};


  
  export default Home;