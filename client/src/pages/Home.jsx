import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import micImg from "../images/mic-button.png";
import tapeImg from "../images/retro-tape-icon.png";
import refreshImg from "../images/refresh-img.png";
import "./Home.css";

const Home = () => {
	const [docs, setDocs] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showPopup, setShowPopup] = useState(false);
	const [popupMessage, setPopupMessage] = useState("");
	const navigate = useNavigate();
	const location = useLocation();

	const fetchDocs = async () => {
		setIsLoading(true);
		try {
			const deviceType = /iPhone|iPad|iPod/.test(navigator.userAgent)
				? "iOS"
				: "other";
			const response = await fetch(
				`http://localhost:8080/get?deviceType=${deviceType}`
			);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			setDocs(data);
			localStorage.setItem("docs", JSON.stringify(data));
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		const storedDocs = JSON.parse(localStorage.getItem("docs"));
		if (storedDocs && storedDocs.length > 0) {
			setDocs(storedDocs);
			setIsLoading(false);
		} else {
			fetchDocs();
		}

		// Check for upload status from location state
		if (location.state?.uploadStatus) {
			setShowPopup(true);
			setPopupMessage(location.state.uploadStatus);
			// Clear the location state
			navigate(location.pathname, { replace: true, state: {} });
		}
	}, [location, navigate]);

	const handleFetchNewItems = () => {
		fetchDocs();
	};

	const handleRecordClick = () => {
		navigate("/recordvent");
	};

	if (isLoading) {
		return (
			<div className="loading-screen">
				<div className="loading-spinner"></div>
				<p className="loading-text">Loading your tapes...</p>
			</div>
		);
	}

	return (
		<>
			<main>
				<div id="tapes-container">
					<div id="tapes" style={{ position: "relative" }}>
						{docs.map((doc, index) => (
							<Link to={`viewvent/${doc._id}`} key={index}>
								<div className="tape">
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
				</div>
				<div id="btns-container">
					<button
						onClick={handleFetchNewItems}
						id="refresh-button"
						className="btn"
					>
						<img src={refreshImg} alt="refreshBtn" />
					</button>
					<div id="record-button" className="btn" onClick={handleRecordClick}>
						<img src={micImg} alt="mic-image" />
					</div>
				</div>
			</main>
			{showPopup && (
				<div className="popup">
					<p>{popupMessage}</p>
					<button onClick={() => setShowPopup(false)}>Close</button>
				</div>
			)}
		</>
	);
};

export default Home;
