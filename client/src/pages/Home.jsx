import React, { useContext, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import micImg from "../images/mic-1-removebg-preview (1).png";
import tapeImg from "../images/retro-tape-icon.png";
import "./Home.css";
import { UserContext } from "./UserContext";

const Home = () => {
    const [docs, setDocs] = useState([]);
    const { value, setValue } = useContext(UserContext);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const response = await fetch('http://localhost:8080/get'); // Update the URL with your server URL
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setDocs(data);
                setValue({...value, docs: data}); // Update UserContext with fetched data
                // console.log(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchDocs();
    }, []); // Empty dependency array ensures this effect runs only once

    // Print the context value to the console
    console.log('Context value:', value);

    return (
        <>
            <main>
                <div id="tapes-container">
                    <div id="tapes" style={{ position: "relative" }}>
                        {docs.map((doc, index) => (
                            <Link to={"viewvent/" + doc._id} key={index}>
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
