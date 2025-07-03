import React, { useEffect, useState } from "react";

export const Admin = () => {
    const [articulos, setArticulos] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [error, setError] = useState("");
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [users, setUsers] = useState([]);
    const [userForm, setUserForm] = useState({ username: "", password: "", role: "usuario" });
    const [userMsg, setUserMsg] = useState("");
    const [editUser, setEditUser] = useState(null);
    const [editUserForm, setEditUserForm] = useState({ password: "", role: "usuario" });
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const currentUser = localStorage.getItem("username");
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

    // Obtener usuarios (solo los del diccionario, para demo)
    const fetchUsers = async () => {
        let backendUrl = import.meta.env.VITE_BACKEND_URL;
        if (backendUrl.endsWith("/")) backendUrl = backendUrl.slice(0, -1);
        const token = localStorage.getItem("token");
        try {
            const resp = await fetch(`${backendUrl}/api/users`, {
                headers: { "Authorization": "Bearer " + token }
            });
            if (resp.ok) setUsers(await resp.json());
        } catch { }
    };

    useEffect(() => {
        fetchUsers();
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

    // Crear usuario
    const handleUserChange = e => {
        const { name, value } = e.target;
        setUserForm({ ...userForm, [name]: value });
    };

    const handleUserCreate = async e => {
        e.preventDefault();
        setUserMsg("");
        let backendUrl = import.meta.env.VITE_BACKEND_URL;
        if (backendUrl.endsWith("/")) backendUrl = backendUrl.slice(0, -1);
        const token = localStorage.getItem("token");
        try {
            const resp = await fetch(`${backendUrl}/api/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(userForm)
            });
            const data = await resp.json();
            if (!resp.ok) {
                setUserMsg(data.msg || "Error al crear usuario");
                return;
            }
            setUserMsg("Usuario creado correctamente");
            setUserForm({ username: "", password: "", role: "usuario" });
            fetchUsers();
        } catch {
            setUserMsg("Error de conexión");
        }
    };

    // Eliminar usuario
    const handleUserDelete = async username => {
        if (!window.confirm(`¿Seguro que deseas eliminar el usuario ${username}?`)) return;
        let backendUrl = import.meta.env.VITE_BACKEND_URL;
        if (backendUrl.endsWith("/")) backendUrl = backendUrl.slice(0, -1);
        const token = localStorage.getItem("token");
        try {
            const resp = await fetch(`${backendUrl}/api/users/${username}`, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            });
            const data = await resp.json();
            setUserMsg(data.msg);
            fetchUsers();
        } catch {
            setUserMsg("Error de conexión");
        }
    };

    // Editar usuario
    const handleEditUser = (user) => {
        setEditUser(user.username);
        setEditUserForm({ password: "", role: user.role });
    };

    const handleEditUserChange = e => {
        const { name, value } = e.target;
        setEditUserForm({ ...editUserForm, [name]: value });
    };

    const handleEditUserSave = async (username) => {
        let backendUrl = import.meta.env.VITE_BACKEND_URL;
        if (backendUrl.endsWith("/")) backendUrl = backendUrl.slice(0, -1);
        const token = localStorage.getItem("token");
        try {
            const resp = await fetch(`${backendUrl}/api/users/${username}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(editUserForm)
            });
            const data = await resp.json();
            setUserMsg(data.msg);
            setEditUser(null);
            fetchUsers();
        } catch {
            setUserMsg("Error de conexión");
        }
    };

    const handleExportInventario = async () => {
        let backendUrl = import.meta.env.VITE_BACKEND_URL;
        if (backendUrl.endsWith("/")) backendUrl = backendUrl.slice(0, -1);
        const token = localStorage.getItem("token");
        const resp = await fetch(`${backendUrl}/api/items/export`, {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!resp.ok) return alert("No se pudo descargar el inventario");
        const blob = await resp.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "inventario.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

    const handleExportTickets = async () => {
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
            <h2>Panel de Administración</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Sección de gestión de usuarios */}
            <h4 className="mt-4">Gestión de Usuarios</h4>
            <form className="mb-3" onSubmit={handleUserCreate} style={{ maxWidth: 400 }}>
                <div className="mb-2">
                    <input type="text" className="form-control" name="username" placeholder="Usuario" value={userForm.username} onChange={handleUserChange} />
                </div>
                <div className="mb-2">
                    <input type="password" className="form-control" name="password" placeholder="Contraseña" value={userForm.password} onChange={handleUserChange} />
                </div>
                <div className="mb-2">
                    <select className="form-select" name="role" value={userForm.role} onChange={handleUserChange}>
                        <option value="usuario">Usuario</option>
                        <option value="tecnico">Técnico</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
                <button className="btn btn-primary btn-sm" type="submit">Crear usuario</button>
                {userMsg && <div className="mt-2 alert alert-info py-1">{userMsg}</div>}
            </form>
            <div className="table-responsive">
                <table className="table table-bordered table-sm">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.username}>
                                <td>{u.username}</td>
                                <td>{u.role}</td>
                                <td>
                                    <span
                                        title={u.username === currentUser ? "Activo" : "Inactivo"}
                                        style={{
                                            display: "inline-block",
                                            width: 12,
                                            height: 12,
                                            borderRadius: "50%",
                                            background: u.username === currentUser ? "#28a745" : "#dc3545",
                                            border: "1px solid #888"
                                        }}
                                    ></span>
                                </td>
                                <td>
                                    {u.username !== "Levi" && (
                                        editUser === u.username ? (
                                            <>
                                                <input
                                                    type="password"
                                                    className="form-control form-control-sm d-inline-block w-auto me-2"
                                                    name="password"
                                                    placeholder="Nueva contraseña"
                                                    value={editUserForm.password}
                                                    onChange={handleEditUserChange}
                                                />
                                                <button className="btn btn-success btn-sm me-1" onClick={() => handleEditUserSave(u.username)}>
                                                    Guardar
                                                </button>
                                                <button className="btn btn-secondary btn-sm" onClick={() => setEditUser(null)}>
                                                    Cancelar
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn btn-warning btn-sm me-1" onClick={() => handleEditUser(u)}>
                                                    Editar
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleUserDelete(u.username)}>
                                                    Eliminar
                                                </button>
                                            </>
                                        )
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h4 className="mt-5">Gestión de Inventario</h4>
            <button className="btn btn-success mb-3" onClick={handleExportInventario}>
                Descargar Inventario Excel
            </button>
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
            <button className="btn btn-success mb-3" onClick={handleExportTickets}>
                Descargar Tickets Excel
            </button>
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
