import { Outlet, Link } from "react-router-dom";
import React from "react";
import "./Layout.css";
const Layout = () => {
	return (
		<>
					<div id="logo">
						<Link to="/">AnonyVent</Link>
						<p>vent and let go</p>
					</div>

			<Outlet />
		</>
	);
};

export default Layout;
