import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";

export const Navbar = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const role = localStorage.getItem("role");
	const username = localStorage.getItem("username");
	const [darkMode, setDarkMode] = useState(
		localStorage.getItem("darkMode") === "true"
	);

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("role");
		localStorage.removeItem("username");
		navigate("/login");
	};

	const isActive = !!role;

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
		<nav className={`navbar navbar-expand ${darkMode ? "navbar-dark bg-dark" : "bg-light"} border-bottom mb-4`}>
			<div className="container justify-content-center">
				<ul className="nav">
					<li className="nav-item">
						<Link to="/inventario" className={`nav-link${location.pathname === "/inventario" ? " active" : ""}`}>Ver Inventario</Link>
					</li>
					{role === "admin" && (
						<li className="nav-item">
							<Link to="/inventario/agregar" className={`nav-link${location.pathname === "/inventario/agregar" ? " active" : ""}`}>Agregar al Inventario</Link>
						</li>
					)}
					<li className="nav-item">
						<Link to="/tickets/crear" className={`nav-link${location.pathname === "/tickets/crear" ? " active" : ""}`}>Crear Ticket</Link>
					</li>
					<li className="nav-item">
						<Link to="/tickets" className={`nav-link${location.pathname === "/tickets" ? " active" : ""}`}>Ver Estado de Tickets</Link>
					</li>
					{role === "admin" && (
						<li className="nav-item">
							<Link to="/admin" className="nav-link">Panel Admin</Link>
						</li>
					)}
					<li className="nav-item d-flex align-items-center ms-3">
						<button
							className={`btn btn-sm ${darkMode ? "btn-light" : "btn-dark"} me-2`}
							onClick={toggleDarkMode}
							type="button"
						>
							{darkMode ? "Modo claro" : "Modo oscuro"}
						</button>
					</li>
					{role && (
						<li className="nav-item d-flex align-items-center ms-3">
							<span
								className="me-2"
								title={isActive ? "Activo" : "Inactivo"}
								style={{
									display: "inline-block",
									width: 12,
									height: 12,
									borderRadius: "50%",
									background: isActive ? "#28a745" : "#dc3545",
									border: "1px solid #888",
									marginRight: 6,
								}}
							></span>
							<span className="me-2 text-secondary">Usuario: {username}</span>
							<button className="btn btn-outline-danger" onClick={handleLogout}>
								Cerrar sesión
							</button>
						</li>
					)}
					{!role && (
						<li className="nav-item d-flex align-items-center ms-3">
							<span
								className="me-2"
								title="Inactivo"
								style={{
									display: "inline-block",
									width: 12,
									height: 12,
									borderRadius: "50%",
									background: "#dc3545",
									border: "1px solid #888",
									marginRight: 6,
								}}
							></span>
							<button className="btn btn-outline-primary" onClick={() => navigate("/login")}>
								Iniciar sesión
							</button>
						</li>
					)}
				</ul>
			</div>
		</nav>
	);
};