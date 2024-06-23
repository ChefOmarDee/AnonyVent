import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import NoPage from "./pages/NoPage";
import RecordVent from "./pages/RecordVent";
import ViewVent from "./pages/ViewVent";
import Home from "./pages/Home";
import { UserContext } from "./pages/UserContext";

export default function App() {
	const [value, setValue] = useState([
		{
			key1: "value1",
			key2: "value2",
			key3: "value3",
		},
		{
			key1: "anotherValue1",
			key2: "anotherValue2",
			key3: "anotherValue3",
		},
	]);
	return (
		<BrowserRouter>
			<UserContext.Provider value={{ value, setValue }}>
				<Routes>
					<Route path="/" element={<Layout />}>
						<Route index element={<Home />} />
						<Route path="recordvent" element={<RecordVent />} />
						<Route path="viewvent" element={<ViewVent />} />
						<Route path="*" element={<NoPage />} />
					</Route>
				</Routes>
			</UserContext.Provider>
		</BrowserRouter>
	);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
