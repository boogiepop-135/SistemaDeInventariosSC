import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

export const TicketDetalle = () => {
    const { ticket_id } = useParams();
    const navigate = useNavigate();
    const { store } = useContext(Context);

    const [ticket, setTicket] = useState(null);
    const [editableData, setEditableData] = useState({ status: "", comments: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchTicket = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const resp = await fetch(`${backendUrl}/api/tickets/${ticket_id}`, {
                headers: { "Authorization": "Bearer " + token }
            });
            if (!resp.ok) {
                setError("Ticket no encontrado o no tienes permiso para verlo.");
                return;
            }
            const data = await resp.json();
            setTicket(data);
            setEditableData({
                status: data.status || "",
                comments: data.comments || ""
            });
        } catch (err) {
            setError("Error de conexión al cargar el ticket.");
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [ticket_id]);

    const handleChange = e => {
        setEditableData({ ...editableData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            const token = localStorage.getItem("token");
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const resp = await fetch(`${backendUrl}/api/tickets/${ticket_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(editableData)
            });
            if (!resp.ok) {
                const data = await resp.json();
                setError(data.msg || "No se pudo actualizar el ticket.");
                return;
            }
            setSuccess("Ticket actualizado correctamente.");
            fetchTicket(); // Recargar datos del ticket
        } catch (err) {
            setError("Error de conexión al actualizar el ticket.");
        }
    };

    if (!ticket) return <div className="container mt-5">{error || "Cargando ticket..."}</div>;

    const isAdmin = store.role === "admin";

    return (
        <div className="container mt-5">
            <h2>Detalles del Ticket #{ticket.id}</h2>
            <div className="card mt-4">
                <div className="card-header">
                    Título: {ticket.title}
                </div>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item"><strong>Estado:</strong> {ticket.status}</li>
                    <li className="list-group-item"><strong>Descripción:</strong> {ticket.description}</li>
                    <li className="list-group-item"><strong>Sucursal:</strong> {ticket.branch}</li>
                    <li className="list-group-item"><strong>Departamento:</strong> {ticket.department}</li>
                    <li className="list-group-item"><strong>Prioridad:</strong> {ticket.priority}</li>
                    <li className="list-group-item"><strong>Tipo de Incidencia:</strong> {ticket.incident_type}</li>
                    <li className="list-group-item"><strong>Creado por:</strong> {ticket.created_by}</li>
                    <li className="list-group-item"><strong>Fecha de creación:</strong> {new Date(ticket.created_at).toLocaleString()}</li>
                    <li className="list-group-item">
                        <strong>Comentarios del técnico:</strong> {ticket.comments || "Sin comentarios"}
                        <div className="alert alert-info mt-2">
                            <i className="fas fa-info-circle me-2"></i>
                            Muy pronto podrás ver más comentarios y actualizaciones en tiempo real.
                        </div>
                    </li>
                </ul>
            </div>

            {isAdmin && (
                <form onSubmit={handleSubmit} className="mt-4 card p-3">
                    <h4>Panel de Administrador</h4>
                    <div className="mb-3">
                        <label className="form-label">Actualizar Estado</label>
                        <select className="form-select" name="status" value={editableData.status} onChange={handleChange}>
                            <option value="pendiente">Pendiente</option>
                            <option value="en proceso">En Proceso</option>
                            <option value="resuelto">Resuelto</option>
                            <option value="cerrado">Cerrado</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Añadir/Editar Comentarios</label>
                        <textarea className="form-control" name="comments" value={editableData.comments} onChange={handleChange} />
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <button type="submit" className="btn btn-primary">Actualizar Ticket</button>
                </form>
            )}
        </div>
    );
};
