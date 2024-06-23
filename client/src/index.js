import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./pages/Layout";
import NoPage from "./pages/NoPage";
import RecordVent from "./pages/RecordVent";
import { UserContext } from "./pages/UserContext";
import ViewVent from "./pages/ViewVent";

export default function App() {
	const [value, setValue] = useState([]);
	return (
		<BrowserRouter>
			<UserContext.Provider value={{ value, setValue }}>
				<Routes>
					<Route path="/" element={<Layout />}>
						<Route index element={<Home />} />
						<Route path="recordvent" element={<RecordVent />} />
						<Route path="viewvent">
							<Route path=":userId" element={<ViewVent />} />
							<Route path="/viewvent/" element={<ViewVent />}/>
						</Route>
						<Route path="*" element={<NoPage />} />
					</Route>
				</Routes>
			</UserContext.Provider>
		</BrowserRouter>
	);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
