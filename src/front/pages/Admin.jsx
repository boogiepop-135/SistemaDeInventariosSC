import React, { useEffect, useState } from "react";

export const Admin = () => {
    const [articulos, setArticulos] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [error, setError] = useState("");
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    let backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (backendUrl.endsWith("/")) backendUrl = backendUrl.slice(0, -1);

    // Cargar inventario y tickets
    useEffect(() => {
        const fetchData = async () => {
            try {
                const itemsResp = await fetch(`${backendUrl}/api/items`, {
                    headers: { "Authorization": "Bearer " + token }
                });
                const ticketsResp = await fetch(`${backendUrl}/api/tickets`, {
                    headers: { "Authorization": "Bearer " + token }
                });
                if (!itemsResp.ok || !ticketsResp.ok) throw new Error("Error al cargar datos");
                setArticulos(await itemsResp.json());
                setTickets(await ticketsResp.json());
            } catch {
                setError("Error al cargar inventario o tickets");
            }
        };
        fetchData();
    }, [token, backendUrl]);

    // Editar inventario
    const handleEdit = (item) => {
        setEditId(item.id);
        setEditForm({ ...item });
    };

    const handleEditChange = e => {
        const { name, value } = e.target;
        setEditForm({ ...editForm, [name]: value });
    };

    const handleEditSave = async () => {
        try {
            const resp = await fetch(`${backendUrl}/api/items/${editId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(editForm)
            });
            if (!resp.ok) throw new Error("Error al guardar cambios");
            // Actualiza la lista
            setArticulos(articulos.map(a => a.id === editId ? { ...editForm } : a));
            setEditId(null);
        } catch {
            setError("Error al guardar cambios");
        }
    };

    // Marcar ticket como resuelto
    const handleTicketResuelto = async (ticket) => {
        try {
            const resp = await fetch(`${backendUrl}/api/tickets/${ticket.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ ...ticket, status: "solucionado" })
            });
            if (!resp.ok) throw new Error("Error al actualizar ticket");
            setTickets(tickets.map(t => t.id === ticket.id ? { ...t, status: "solucionado" } : t));
        } catch {
            setError("Error al actualizar ticket");
        }
    };

    return (
        <div className="container mt-5">
            <h2>Panel de Administración</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <h4 className="mt-4">Gestión de Inventario</h4>
            <div className="table-responsive">
                <table className="table table-bordered table-striped mt-3">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Tipo</th>
                            <th>Marca</th>
                            <th>Modelo</th>
                            <th>Color</th>
                            <th>Estado</th>
                            <th>Asignado a</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articulos.map(item => (
                            <tr key={item.id}>
                                {editId === item.id ? (
                                    <>
                                        <td><input name="name" value={editForm.name} onChange={handleEditChange} className="form-control" /></td>
                                        <td><input name="type" value={editForm.type} onChange={handleEditChange} className="form-control" /></td>
                                        <td><input name="brand" value={editForm.brand} onChange={handleEditChange} className="form-control" /></td>
                                        <td><input name="model" value={editForm.model} onChange={handleEditChange} className="form-control" /></td>
                                        <td><input name="color" value={editForm.color} onChange={handleEditChange} className="form-control" /></td>
                                        <td>
                                            <select name="status" value={editForm.status} onChange={handleEditChange} className="form-select">
                                                <option value="stock">En stock</option>
                                                <option value="asignado">Asignado</option>
                                            </select>
                                        </td>
                                        <td><input name="assigned_to" value={editForm.assigned_to} onChange={handleEditChange} className="form-control" /></td>
                                        <td>
                                            <button className="btn btn-success btn-sm me-2" onClick={handleEditSave}>Guardar</button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}>Cancelar</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{item.name}</td>
                                        <td>{item.type}</td>
                                        <td>{item.brand}</td>
                                        <td>{item.model}</td>
                                        <td>{item.color}</td>
                                        <td>{item.status}</td>
                                        <td>{item.assigned_to}</td>
                                        <td>
                                            <button className="btn btn-primary btn-sm" onClick={() => handleEdit(item)}>Editar</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h4 className="mt-5">Gestión de Tickets</h4>
            <div className="table-responsive">
                <table className="table table-bordered table-striped mt-3">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Estado</th>
                            <th>Prioridad</th>
                            <th>Persona</th>
                            <th>Fecha/Hora</th>
                            <th>Acciones</th>
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
                                <td>{ticket.created_by}</td>
                                <td>{ticket.created_at}</td>
                                <td>
                                    {role === "admin" && ticket.status !== "solucionado" && (
                                        <button className="btn btn-success btn-sm" onClick={() => handleTicketResuelto(ticket)}>
                                            Marcar como resuelto
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
