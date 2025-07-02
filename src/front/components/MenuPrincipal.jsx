import { Link, useLocation } from "react-router-dom";

export const MenuPrincipal = () => {
    const location = useLocation();
    return (
        <nav className="bg-light border-bottom mb-4">
            <ul className="nav justify-content-center py-2">
                <li className="nav-item">
                    <Link to="/inventario" className={`nav-link${location.pathname === "/inventario" ? " active" : ""}`}>Ver Inventario</Link>
                </li>
                <li className="nav-item">
                    <Link to="/inventario/agregar" className={`nav-link${location.pathname === "/inventario/agregar" ? " active" : ""}`}>Agregar al Inventario</Link>
                </li>
                <li className="nav-item">
                    <Link to="/tickets/crear" className={`nav-link${location.pathname === "/tickets/crear" ? " active" : ""}`}>Crear Ticket</Link>
                </li>
                <li className="nav-item">
                    <Link to="/tickets" className={`nav-link${location.pathname === "/tickets" ? " active" : ""}`}>Ver Estado de Tickets</Link>
                </li>
            </ul>
        </nav>
    );
};
