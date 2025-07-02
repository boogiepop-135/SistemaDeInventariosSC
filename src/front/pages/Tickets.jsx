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

    const handleExport = async () => {
        let backendUrl = import.meta.env.VITE_BACKEND_URL;
        if (backendUrl.endsWith("/")) backendUrl = backendUrl.slice(0, -1);
        const token = localStorage.getItem("token");
        const resp = await fetch(`${backendUrl}/api/tickets/export`, {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!resp.ok) return alert("No se pudo descargar los tickets");
        const blob = await resp.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "tickets.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="container mt-5">
            <h2>Estado de Tickets</h2>
            <button className="btn btn-success mb-3" onClick={handleExport}>
                Descargar Excel
            </button>
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
                                <th>Estado</th>
                                <th>Prioridad</th>
                                <th>Sucursal</th>
                                <th>Departamento</th>
                                <th>Persona</th>
                                <th>Comentarios</th>
                                <th>ID Artículo</th>
                                <th>Fecha/Hora</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td>{ticket.title}</td>
                                    <td>
                                        {ticket.status === "solucionado"
                                            ? <span className="badge bg-success">Resuelto</span>
                                            : ticket.status === "pendiente"
                                                ? <span className="badge bg-warning text-dark">Pendiente</span>
                                                : <span className="badge bg-info text-dark">{ticket.status}</span>
                                        }
                                    </td>
                                    <td>{ticket.priority}</td>
                                    <td>{ticket.branch}</td>
                                    <td>{ticket.department}</td>
                                    <td>{ticket.created_by}</td>
                                    <td>{ticket.comments}</td>
                                    <td>{ticket.item_id}</td>
                                    <td>{ticket.created_at}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
