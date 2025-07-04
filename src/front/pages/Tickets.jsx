import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const Tickets = () => {
    const [tickets, setTickets] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                let backendUrl = import.meta.env.VITE_BACKEND_URL;
                if (backendUrl.endsWith("/")) backendUrl = backendUrl.slice(0, -1);

                const token = localStorage.getItem("token");
                const response = await fetch(`${backendUrl}/api/tickets`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Error al cargar tickets");
                }

                const data = await response.json();
                setTickets(data);
            } catch (err) {
                setError("Error al cargar los tickets: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    if (loading) return <div className="container mt-5">Cargando tickets...</div>;

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Tickets de Soporte</h2>
                <Link to="/crear-ticket" className="btn btn-primary">
                    Crear Nuevo Ticket
                </Link>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {tickets.length === 0 ? (
                <p>No hay tickets registrados.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Título</th>
                                <th>Estado</th>
                                <th>Prioridad</th>
                                <th>Creado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td>{ticket.id}</td>
                                    <td>{ticket.title}</td>
                                    <td>
                                        <span className={`badge bg-${ticket.status === "abierto" ? "success" :
                                                ticket.status === "en_proceso" ? "warning" :
                                                    "secondary"
                                            }`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td>{ticket.priority}</td>
                                    <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <Link
                                            to={`/ticket/${ticket.id}`}
                                            className="btn btn-sm btn-info me-2"
                                        >
                                            Ver
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};