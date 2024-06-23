import { Outlet, Link } from "react-router-dom";
import React from "react";
//import "./Layout.css";
const Layout = () => {
	return (
		<>
			<nav>
				<ul>
					<li>
						<Link to="/">AnonyVent</Link>
					</li>
					<li>
						<Link to="/recordvent">recordvent</Link>
					</li>
					<li>
						<Link to="/viewvent">viewvent</Link>
					</li>
				</ul>
			</nav>

			<Outlet />
		</>
	);
};

export default Layout;
