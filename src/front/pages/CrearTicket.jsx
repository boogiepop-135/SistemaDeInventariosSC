import React, { useState } from "react";

const sucursales = ["matriz", "juriquilla", "centro sur"];
const departamentos = ["cedis", "cepro", "piso"];
const prioridades = ["normal", "urgente", "critico"];
const estados = ["pendiente", "solucionado"];

export const CrearTicket = () => {
    const [form, setForm] = useState({
        title: "",
        description: "",
        item_id: "",
        status: "pendiente",
        created_by: "",
        branch: "",
        department: "",
        priority: "normal",
        comments: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = e => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: value
        });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        setSuccess("");
        const required = ["title", "branch", "department", "priority", "status"];
        for (let field of required) {
            if (!form[field]) {
                setError(`Falta el campo requerido: ${field}`);
                return;
            }
        }
        try {
            let backendUrl = import.meta.env.VITE_BACKEND_URL;
            if (backendUrl.endsWith("/")) backendUrl = backendUrl.slice(0, -1);
            const url = `${backendUrl}/api/tickets`;
            const token = localStorage.getItem("token");
            const resp = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    ...form,
                    item_id: form.item_id ? parseInt(form.item_id) : null
                })
            });
            if (!resp.ok) {
                const data = await resp.json();
                setError(data.message || "Error al crear ticket");
                return;
            }
            setSuccess("Ticket creado correctamente");
            setForm({
                title: "",
                description: "",
                item_id: "",
                status: "pendiente",
                created_by: "",
                branch: "",
                department: "",
                priority: "normal",
                comments: ""
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
                    <label className="form-label">Título *</label>
                    <input type="text" className="form-control" name="title" value={form.title} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea className="form-control" name="description" value={form.description} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">ID de Artículo relacionado</label>
                    <input type="number" className="form-control" name="item_id" value={form.item_id} onChange={handleChange} />
                </div>
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
                    <label className="form-label">Estado *</label>
                    <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                        {estados.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
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
        </div>
    );
};
