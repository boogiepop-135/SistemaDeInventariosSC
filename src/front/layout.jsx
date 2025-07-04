import React, { useState } from "react";
import { Link, BrowserRouter, Routes, Route } from "react-router-dom";
import { CrearRequisicion } from "./pages/CrearRequisicion";
import { VerRequisiciones } from "./pages/VerRequisiciones";
import { RequisicionDetalle } from "./pages/RequisicionDetalle";

const sucursales = ["matriz", "juriquilla", "centro sur"];
const departamentos = ["cedis", "cepro", "piso"];
const prioridades = ["normal", "urgente", "critico"];
const incidentTypes = [
    "punto de venta", "celular", "laptop", "conexion a internet", "correo", "inventory", "uber"
];

export const CrearTicket = () => {
    const [form, setForm] = useState({
        description: "", // Añadido campo para descripción
        status: "pendiente", // siempre pendiente al crear
        created_by: "",
        branch: "",
        department: "",
        priority: "normal",
        comments: "",
        incident_type: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = e => {
        const { name, value } = e.target;
        // No permitir cambiar status desde el formulario
        if (name === "status") return;
        setForm({
            ...form,
            [name]: value
        });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        setSuccess("");
        const required = ["branch", "department", "priority", "incident_type", "description"];
        for (let field of required) {
            if (!form[field]) {
                setError(`Falta el campo requerido: ${field}. Por favor completa este campo antes de continuar.`);
                return;
            }
        }
        try {
            let backendUrl = import.meta.env.VITE_BACKEND_URL || "https://humble-space-lamp-wrgjp7p7gj6qhv6g-5000.app.github.dev";
            if (backendUrl.endsWith("/")) backendUrl = backendUrl.slice(0, -1);
            const url = `${backendUrl}/api/tickets`;
            const token = localStorage.getItem("token");
            const resp = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ ...form, status: "pendiente" })
            });
            if (!resp.ok) {
                let data = {};
                try { data = await resp.json(); } catch { }
                setError(
                    data.message ||
                    data.msg ||
                    `Error ${resp.status}: No se pudo crear el ticket. Verifica que todos los campos requeridos estén completos y que tu sesión esté activa.`
                );
                return;
            }
            setSuccess("Ticket creado correctamente");
            setForm({
                description: "",
                status: "pendiente",
                created_by: "",
                branch: "",
                department: "",
                priority: "normal",
                comments: "",
                incident_type: ""
            });
        } catch (err) {
            setError("Error de conexión con el backend");
        }
    };

    return (
        <div className="container mt-5">
            <h2>Crear Ticket</h2>
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-3">
                    <label className="form-label">Sucursal *</label>
                    <select className="form-select" name="branch" value={form.branch} onChange={handleChange}>
                        <option value="">Selecciona sucursal</option>
                        {sucursales.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Departamento *</label>
                    <select className="form-select" name="department" value={form.department} onChange={handleChange}>
                        <option value="">Selecciona departamento</option>
                        {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Prioridad *</label>
                    <select className="form-select" name="priority" value={form.priority} onChange={handleChange}>
                        {prioridades.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Tipo de incidencia *</label>
                    <select className="form-select" name="incident_type" value={form.incident_type} onChange={handleChange}>
                        <option value="">Selecciona tipo</option>
                        {incidentTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Descripción *</label>
                    <textarea className="form-control" name="description" value={form.description} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Persona que levanta el ticket</label>
                    <input type="text" className="form-control" name="created_by" value={form.created_by} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Comentarios</label>
                    <textarea className="form-control" name="comments" value={form.comments} onChange={handleChange} />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <button type="submit" className="btn btn-primary">Crear Ticket</button>
            </form>
            {/* Ejemplo de uso de Link para navegar a los detalles de un ticket */}
            <div className="mt-4">
                <h3>Tickets Existentes</h3>
                {/* Suponiendo que tienes un array de tickets en el estado llamado 'tickets' */}
                {tickets.map(ticket => (
                    <div key={ticket.id} className="border p-3 mb-3">
                        <h4>Ticket ID: {ticket.id}</h4>
                        <p><strong>Sucursal:</strong> {ticket.branch}</p>
                        <p><strong>Departamento:</strong> {ticket.department}</p>
                        <p><strong>Prioridad:</strong> {ticket.priority}</p>
                        <p><strong>Tipo de Incidencia:</strong> {ticket.incident_type}</p>
                        <p><strong>Descripción:</strong> {ticket.description}</p>
                        <p><strong>Estado:</strong> {ticket.status}</p>
                        <Link to={`/tickets/${ticket.id}`} className="btn btn-primary">
                            Ver Detalles
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};
const Layout = () => {
    return (
        <BrowserRouter>
            {/* ...existing code... */}
            <Routes>
                {/* ...otras rutas... */}
                <Route path="/crear-ticket" element={<CrearTicket />} />
                <Route path="/crear-requisicion" element={<CrearRequisicion />} />
                <Route path="/requisiciones" element={<VerRequisiciones />} />
                <Route path="/requisitions/:requisition_id" element={<RequisicionDetalle />} />
                {/* ...otras rutas... */}
            </Routes>
            {/* ...existing code... */}
        </BrowserRouter>
    );
};

export default Layout;