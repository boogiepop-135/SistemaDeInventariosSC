import React, { useEffect, useState } from "react";

export const Tickets = () => {
    const [tickets, setTickets] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                let url = `${backendUrl}/api/tickets`;
                if (backendUrl.endsWith("/")) url = url.replace(/\/+api/, "/api");
                const token = localStorage.getItem("token");
                const resp = await fetch(url, {
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                });
                if (!resp.ok) throw new Error("No se pudo obtener los tickets");
                const data = await resp.json();
                setTickets(data);
            } catch (err) {
                setError("Error al cargar los tickets");
            }
        };
        fetchTickets();
    }, []);

    return (
        <div className="container mt-5">
            <h2>Estado de Tickets</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {tickets.length === 0 && !error && (
                <p>No hay tickets registrados.</p>
            )}
            {tickets.length > 0 && (
                <div className="table-responsive">
                    <table className="table table-bordered table-striped mt-3">
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Sucursal</th>
                                <th>Departamento</th>
                                <th>Prioridad</th>
                                <th>Estado</th>
                                <th>Persona</th>
                                <th>Comentarios</th>
                                <th>ID Artículo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td>{ticket.title}</td>
                                    <td>{ticket.branch}</td>
                                    <td>{ticket.department}</td>
                                    <td>{ticket.priority}</td>
                                    <td>{ticket.status}</td>
                                    <td>{ticket.created_by}</td>
                                    <td>{ticket.comments}</td>
                                    <td>{ticket.item_id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
