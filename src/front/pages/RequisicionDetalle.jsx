import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext"; // Esta ruta ahora es correcta

export const RequisicionDetalle = () => {
    const { requisition_id } = useParams();
    const navigate = useNavigate();
    const { store } = useContext(Context);

    const [requisition, setRequisition] = useState(null);
    const [editableData, setEditableData] = useState({
        status: "",
        comments: "",
        approval_by: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchRequisition = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://humble-space-lamp-wrgjp7p7gj6qhv6g-5000.app.github.dev";
            const resp = await fetch(`${backendUrl}/api/requisitions/${requisition_id}`, {
                headers: { "Authorization": "Bearer " + token }
            });
            if (!resp.ok) {
                setError("Requisición no encontrada o no tienes permiso para verla.");
                setLoading(false);
                return;
            }
            const data = await resp.json();
            setRequisition(data);
            setEditableData({
                status: data.status || "",
                comments: data.comments || "",
                approval_by: data.approval_by || ""
            });
            setLoading(false);
        } catch (err) {
            setError("Error de conexión al cargar la requisición.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequisition();
    }, [requisition_id]);

    const handleChange = e => {
        setEditableData({ ...editableData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            const token = localStorage.getItem("token");
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://humble-space-lamp-wrgjp7p7gj6qhv6g-5000.app.github.dev";
            const resp = await fetch(`${backendUrl}/api/requisitions/${requisition_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(editableData)
            });
            if (!resp.ok) {
                const data = await resp.json();
                setError(data.msg || "No se pudo actualizar la requisición.");
                return;
            }
            setSuccess("Requisición actualizada correctamente.");
            fetchRequisition(); // Recargar datos de la requisición
        } catch (err) {
            setError("Error de conexión al actualizar la requisición.");
        }
    };

    if (loading) return <div className="container mt-5">Cargando requisición...</div>;
    if (!requisition && !loading) return <div className="container mt-5">{error || "Requisición no encontrada"}</div>;

    const isAdmin = store.role === "admin";

    return (
        <div className="container mt-5">
            <h2>Detalles de la Requisición #{requisition.id}</h2>
            <div className="card mt-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{requisition.title}</h5>
                    <span className={`badge bg-${requisition.status === "pendiente" ? "warning" :
                        requisition.status === "aprobada" ? "success" :
                            requisition.status === "rechazada" ? "danger" :
                                requisition.status === "en proceso" ? "info" : "primary"}`}>
                        {requisition.status}
                    </span>
                </div>
                <div className="card-body">
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <h6>Información de la Solicitud</h6>
                            <p><strong>Departamento:</strong> {requisition.department}</p>
                            <p><strong>Solicitado por:</strong> {requisition.requested_by || "No especificado"}</p>
                            <p><strong>Prioridad:</strong> {requisition.priority}</p>
                            <p><strong>Fecha de Creación:</strong> {new Date(requisition.created_at).toLocaleString()}</p>
                            <p><strong>Fecha Esperada:</strong> {requisition.expected_date ? new Date(requisition.expected_date).toLocaleDateString() : "No especificada"}</p>
                        </div>
                        <div className="col-md-6">
                            <h6>Aprobación</h6>
                            <p><strong>Estado:</strong> {requisition.status}</p>
                            <p><strong>Aprobado por:</strong> {requisition.approval_by || "Pendiente de aprobación"}</p>
                        </div>
                    </div>

                    <h6>Descripción</h6>
                    <p>{requisition.description}</p>

                    {requisition.items && (
                        <>
                            <h6 className="mt-4">Items Solicitados</h6>
                            <p className="text-pre-wrap">{requisition.items}</p>
                        </>
                    )}

                    {requisition.comments && (
                        <>
                            <h6 className="mt-4">Comentarios</h6>
                            <p>{requisition.comments}</p>
                        </>
                    )}
                </div>
            </div>

            {isAdmin && (
                <form onSubmit={handleSubmit} className="mt-4 card p-3">
                    <h4>Panel de Administración</h4>
                    <div className="mb-3">
                        <label className="form-label">Actualizar Estado</label>
                        <select className="form-select" name="status" value={editableData.status} onChange={handleChange}>
                            <option value="pendiente">Pendiente</option>
                            <option value="aprobada">Aprobada</option>
                            <option value="rechazada">Rechazada</option>
                            <option value="en proceso">En Proceso</option>
                            <option value="completada">Completada</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Aprobador</label>
                        <input type="text" className="form-control" name="approval_by" value={editableData.approval_by} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Comentarios</label>
                        <textarea className="form-control" name="comments" value={editableData.comments} onChange={handleChange} />
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <button type="submit" className="btn btn-primary">Actualizar Requisición</button>
                </form>
            )}
        </div>
    );
};
