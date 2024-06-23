import tapeImg from "../images/retro-tape-icon.png";
import micImg from "../images/mic-1-removebg-preview (1).png";
import { Link } from "react-router-dom";
import React from "react";
import "./Home.css";

const Home = () => {
	return (
		<>
			<main>
				<div id="tapes-container">
					<div id="tapes" style={{ position: "relative" }}>
						<Link to="viewvent/">
							<div className="tape">
								<img
									className="tapeDisappear"
									src={tapeImg}
									alt="tape1"
									width="250"
									height="250"
								/>
								<div className="tape-text">I can't get over my ex</div>
							</div>
						</Link>
						<Link to="viewvent/">
							<div className="tape">
								<img
									className="tapeDisappear"
									src={tapeImg}
									alt="tape2"
									width="250"
									height="250"
								/>
								<div className="tape-text">failing class</div>
							</div>
						</Link>
						<Link to="viewvent/">
							<div className="tape">
								<img
									className="tapeDisappear"
									src={tapeImg}
									alt="tape3"
									width="250"
									height="250"
								/>
								<div className="tape-text">can't stand my professor</div>
							</div>
						</Link>
					</div>
					<Link to="/recordvent">
						<div id="record-button">
							<img src={micImg} alt="mic-image" />
						</div>
					</Link>
				</div>
			</main>
		</>
	);
};

export default Home;
