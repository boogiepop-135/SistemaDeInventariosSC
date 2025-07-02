import React, { useState } from "react";

const tipos = [
    "laptop", "pc", "monitor", "proyector", "control", "cable hdmi", "display port", "periferico mouse o teclado"
];

export const AgregarInventario = () => {
    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "",
        type: "",
        brand: "",
        model: "",
        color: "",
        features: "",
        warranty_date: "",
        manual: false,
        status: "stock",
        assigned_to: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = e => {
        const { name, value, type: inputType, checked } = e.target;
        setForm({
            ...form,
            [name]: inputType === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        setSuccess("");
        const required = ["name", "type"];
        for (let field of required) {
            if (!form[field]) {
                setError(`Falta el campo requerido: ${field}`);
                return;
            }
        }
        try {
            let backendUrl = import.meta.env.VITE_BACKEND_URL;
            if (backendUrl.endsWith("/")) backendUrl = backendUrl.slice(0, -1);
            const url = `${backendUrl}/api/items`;
            const token = localStorage.getItem("token");
            const resp = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(form)
            });
            if (!resp.ok) {
                const data = await resp.json();
                setError(data.message || "Error al agregar artículo");
                return;
            }
            setSuccess("Artículo agregado correctamente");
            setForm({
                name: "",
                description: "",
                category: "",
                type: "",
                brand: "",
                model: "",
                color: "",
                features: "",
                warranty_date: "",
                manual: false,
                status: "stock",
                assigned_to: ""
            });
        } catch (err) {
            setError("Error de conexión con el backend");
        }
    };

    return (
        <div className="container mt-5">
            <h2>Agregar al Inventario</h2>
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-3">
                    <label className="form-label">Nombre *</label>
                    <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <input type="text" className="form-control" name="description" value={form.description} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Categoría</label>
                    <input type="text" className="form-control" name="category" value={form.category} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Tipo *</label>
                    <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                        <option value="">Selecciona tipo</option>
                        {tipos.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Marca</label>
                    <input type="text" className="form-control" name="brand" value={form.brand} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Modelo</label>
                    <input type="text" className="form-control" name="model" value={form.model} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Color</label>
                    <input type="text" className="form-control" name="color" value={form.color} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Características</label>
                    <input type="text" className="form-control" name="features" value={form.features} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Fecha de garantía</label>
                    <input type="date" className="form-control" name="warranty_date" value={form.warranty_date} onChange={handleChange} />
                </div>
                <div className="form-check mb-3">
                    <input className="form-check-input" type="checkbox" name="manual" checked={form.manual} onChange={handleChange} id="manualCheck" />
                    <label className="form-check-label" htmlFor="manualCheck">
                        Manual en existencia
                    </label>
                </div>
                <div className="mb-3">
                    <label className="form-label">Estado</label>
                    <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                        <option value="stock">En stock</option>
                        <option value="asignado">Asignado</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Asignado a</label>
                    <input type="text" className="form-control" name="assigned_to" value={form.assigned_to} onChange={handleChange} />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <button type="submit" className="btn btn-primary">Agregar</button>
            </form>
        </div>
    );
};
