import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import micImg from "../images/mic-1-removebg-preview (1).png";
import tapeImg from "../images/retro-tape-icon.png";
import "./Home.css";
import { UserContext } from "./UserContext";
import refreshImg from "../images/refresh-button-removebg-preview.png";

const Home = () => {
    const { value, setValue } = useContext(UserContext);
    const [docs, setDocs] = useState(value.docs || []);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDocs = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8080/get");
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setDocs(data);
            setValue({ ...value, docs: data });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!value.docs || value.docs.length === 0) {
            fetchDocs();
        } else {
            setIsLoading(false);
        }
    }, []);

    const handleFetchNewItems = () => {
        fetchDocs();
    };

    console.log("Context value:", value);

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
                    <button onClick={handleFetchNewItems} id="refresh-button" className="btn">
                        <img src={refreshImg} alt="refreshBtn" />
                    </button>
                    <Link to="/recordvent">
                        <div id="record-button" className="btn">
                            <img src={micImg} alt="mic-image" />
                        </div>
                    </Link>
                </div>
            </main>
        </>
    );
};

export default Home;
