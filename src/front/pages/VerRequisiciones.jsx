import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const VerRequisiciones = () => {
    const [requisitions, setRequisitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRequisitions = async () => {
            try {
                const token = localStorage.getItem("token");
                let backendUrl = import.meta.env.VITE_BACKEND_URL || "https://humble-space-lamp-wrgjp7p7gj6qhv6g-5000.app.github.dev";
                const resp = await fetch(`${backendUrl}/api/requisitions`, {
                    headers: { "Authorization": "Bearer " + token }
                });
                if (!resp.ok) {
                    throw new Error(`Error ${resp.status}: No se pudieron cargar las requisiciones.`);
                }
                const data = await resp.json();
                setRequisitions(data);
            } catch (err) {
                setError(err.message || "Error al cargar las requisiciones");
            } finally {
                setLoading(false);
            }
        };
        fetchRequisitions();
    }, []);

    const statusBadgeClass = (status) => {
        switch (status) {
            case "pendiente": return "bg-warning";
            case "aprobada": return "bg-success";
            case "rechazada": return "bg-danger";
            case "en proceso": return "bg-info";
            case "completada": return "bg-primary";
            default: return "bg-secondary";
        }
    };

    if (loading) return <div className="container mt-5"><p>Cargando requisiciones...</p></div>;
    if (error) return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>;

    return (
        <div className="container mt-5">
            <h2>Requisiciones</h2>
            {requisitions.length === 0 ? (
                <div className="alert alert-info mt-4">
                    No hay requisiciones disponibles. <Link to="/requisiciones/crear" className="alert-link">Crear una nueva requisición</Link>
                </div>
            ) : (
                <div className="mt-4">
                    <div className="d-flex justify-content-end mb-3">
                        <Link to="/requisiciones/crear" className="btn btn-primary">
                            <i className="fas fa-plus me-2"></i>Nueva Requisición
                        </Link>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Título</th>
                                    <th>Departamento</th>
                                    <th>Prioridad</th>
                                    <th>Estado</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requisitions.map(req => (
                                    <tr key={req.id}>
                                        <td>{req.id}</td>
                                        <td>{req.title}</td>
                                        <td>{req.department}</td>
                                        <td>{req.priority}</td>
                                        <td>
                                            <span className={`badge ${statusBadgeClass(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td>{new Date(req.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <Link to={`/requisitions/${req.id}`} className="btn btn-sm btn-primary me-2">
                                                Ver
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
