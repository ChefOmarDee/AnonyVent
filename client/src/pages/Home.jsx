import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import micImg from "../images/mic-1-removebg-preview (1).png";
import tapeImg from "../images/retro-tape-icon.png";
import "./Home.css";
import { UserContext } from "./UserContext";

const Home = () => {
	const [docs, setDocs] = useState([]);
	const [titles, setTitles] = useState([]);
	const { user, setUser } = useUserContext();

	useEffect(() => {
        const fetchDocs = async () => {
            try {
                const response = await fetch('http://localhost:8080/get'); // Update the URL with your server URL
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
				const titles = data.map(doc => doc.title); // Extract titles from each document
				setTitles(titles);
                setDocs(data);
                console.log(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchDocs();
    }, []); // Empty dependency array ensures this effect runs only once

	return (
		<>
			<main>
				<div id="tapes-container">
					{/* <div id="tapes" style={{ position: "relative" }}>
						<div className="tape">
							<img
								className="tapeDisappear"
								src={tapeImg}
								alt="tape1"
								width="250"
								height="250"
							/>
							<div className="tape-text"></div>
						</div>
						<div className="tape">
							<img
								className="tapeDisappear"
								src={tapeImg}
								alt="tape2"
								width="250"
								height="250"
							/>
							<div className="tape-text">afasdf</div>
						</div>
						<div className="tape">
							<img
								className="tapeDisappear"
								src={tapeImg}
								alt="tape3"
								width="250"
								height="250"
							/>
							<div className="tape-text">afasdf</div>
						</div> */}
						<div id="tapes" style={{ position: "relative" }}>
						{docs.map((doc, index) => (
                            <Link to={"viewvent/" + doc._id}><div className="tape" key={index}>
                                <img
                                    className="tapeDisappear"
                                    src={tapeImg}
                                    alt={`tape${index}`}
                                    width="250"
                                    height="250"
                                />
                                <div className="tape-text">{doc.title}</div>
                            </div>
							</Link>
                        ))}
					</div>
					<Link to="/recordvent">
						<div id="record-button">
							<img src={micImg} alt="mic-image" />
						</div>
					</Link>
				</div>
				{/* <button onClick={fetchTitles}>Fetch Titles</button> */}
			</main>
		</>
	);
};

export default Home;
