import { Link, useLocation, useNavigate } from "react-router-dom";

export const Navbar = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const role = localStorage.getItem("role");

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("role");
		navigate("/login");
	};

	return (
		<nav className="navbar navbar-expand bg-light border-bottom mb-4">
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
					{role && (
						<li className="nav-item">
							<button className="btn btn-outline-danger ms-3" onClick={handleLogout}>
								Cerrar sesión
							</button>
						</li>
					)}
				</ul>
			</div>
		</nav>
	);
};