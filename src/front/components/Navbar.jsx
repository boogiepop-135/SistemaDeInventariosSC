import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

export const Navbar = () => {
	const { store, actions } = useContext(Context);
	const location = useLocation();
	const navigate = useNavigate();
	const [darkMode, setDarkMode] = useState(
		localStorage.getItem("darkMode") === "true"
	);

	const handleLogout = () => {
		actions.logout();
		navigate("/login");
	};

	const toggleDarkMode = () => {
		const newMode = !darkMode;
		setDarkMode(newMode);
		localStorage.setItem("darkMode", newMode);
		if (newMode) {
			document.body.classList.add("bg-dark", "text-light");
		} else {
			document.body.classList.remove("bg-dark", "text-light");
		}
	};

	React.useEffect(() => {
		if (darkMode) {
			document.body.classList.add("bg-dark", "text-light");
		} else {
			document.body.classList.remove("bg-dark", "text-light");
		}
	}, [darkMode]);

	return (
		<nav className={`navbar navbar-expand-lg navbar-dark ${darkMode ? "bg-dark" : "bg-light"} border-bottom mb-4`}>
			<div className="container">
				<Link className="navbar-brand" to="/">
					<i className="fas fa-cogs me-2"></i>
					Sistema Cosmecito
				</Link>
				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#navbarNav"
					aria-controls="navbarNav"
					aria-expanded="false"
					aria-label="Toggle navigation"
				>
					<span className="navbar-toggler-icon"></span>
				</button>
				<div className="collapse navbar-collapse" id="navbarNav">
					<ul className="navbar-nav me-auto mb-2 mb-lg-0">
						<li className="nav-item">
							<Link className="nav-link" to="/">Home</Link>
						</li>
						{store.token && (
							<>
								<li className="nav-item">
									<Link className="nav-link" to="/inventario">Inventario</Link>
								</li>
								<li className="nav-item">
									<Link className="nav-link" to="/tickets">Tickets</Link>
								</li>
								<li className="nav-item">
									<Link className="nav-link" to="/requisiciones">Requisiciones</Link>
								</li>
								{store.role === "admin" && (
									<li className="nav-item">
										<Link className="nav-link" to="/admin">Admin</Link>
									</li>
								)}
							</>
						)}
					</ul>
					<div className="d-flex">
						{store.token ? (
							<button onClick={handleLogout} className="btn btn-outline-light">
								<i className="fas fa-sign-out-alt me-2"></i>Logout
							</button>
						) : (
							<Link to="/login" className="btn btn-primary">
								<i className="fas fa-sign-in-alt me-2"></i>Login
							</Link>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
};