import React, { useState } from "react";

const departamentos = ["cedis", "cepro", "piso", "ventas", "compras", "it", "rh"];
const prioridades = ["baja", "normal", "alta", "urgente"];

export const CrearRequisicion = () => {
    const [form, setForm] = useState({
        description: "",
        requested_by: "",
        department: "",
        priority: "normal",
        comments: "",
        items: "",
        expected_date: ""
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
        const required = ["description", "department", "priority"];
        for (let field of required) {
            if (!form[field]) {
                setError(`Falta el campo requerido: ${field}. Por favor completa este campo antes de continuar.`);
                return;
            }
        }
        try {
            let backendUrl = import.meta.env.VITE_BACKEND_URL || "https://humble-space-lamp-wrgjp7p7gj6qhv6g-5000.app.github.dev";
            if (backendUrl.endsWith("/")) backendUrl = backendUrl.slice(0, -1);
            const url = `${backendUrl}/api/requisitions`;
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
                    `Error ${resp.status}: No se pudo crear la requisición. Verifica que todos los campos requeridos estén completos y que tu sesión esté activa.`
                );
                return;
            }
            setSuccess("Requisición creada correctamente");
            setForm({
                description: "",
                requested_by: "",
                department: "",
                priority: "normal",
                comments: "",
                items: "",
                expected_date: ""
            });
        } catch (err) {
            setError("Error de conexión con el backend");
        }
    };

    return (
        <div className="container mt-5">
            <h2>Crear Requisición</h2>
            <form onSubmit={handleSubmit} className="mt-4">
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
                    <label className="form-label">Descripción *</label>
                    <textarea className="form-control" name="description" value={form.description} onChange={handleChange}
                        placeholder="Describe qué estás solicitando y por qué lo necesitas" />
                </div>
                <div className="mb-3">
                    <label className="form-label">Items Solicitados</label>
                    <textarea className="form-control" name="items" value={form.items} onChange={handleChange}
                        placeholder="Lista los artículos que necesitas (nombre, cantidad, especificaciones)" />
                </div>
                <div className="mb-3">
                    <label className="form-label">Fecha Esperada</label>
                    <input type="date" className="form-control" name="expected_date" value={form.expected_date} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Solicitado por</label>
                    <input type="text" className="form-control" name="requested_by" value={form.requested_by} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Comentarios Adicionales</label>
                    <textarea className="form-control" name="comments" value={form.comments} onChange={handleChange} />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <button type="submit" className="btn btn-primary">Crear Requisición</button>
            </form>
        </div>
    );
};
