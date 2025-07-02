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
        assigned_to: "",
        physical_status: "",
        area: "",
        recurring_issues: "",
        knowledge_level: "",
        support_person: "",
        support_time: ""
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
        const required = ["name", "type", "category"];
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
                assigned_to: "",
                physical_status: "",
                area: "",
                recurring_issues: "",
                knowledge_level: "",
                support_person: "",
                support_time: ""
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
                    <label className="form-label">Categoría *</label>
                    <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                        <option value="">Selecciona categoría</option>
                        <option value="PC">PC</option>
                        <option value="Laptop">Laptop</option>
                        <option value="Periférico">Periférico</option>
                        <option value="Impresora">Impresora</option>
                        <option value="Escáner">Escáner</option>
                        <option value="Switch">Switch</option>
                        <option value="Router">Router</option>
                        <option value="Access Point">Access Point</option>
                        <option value="Cableado">Cableado</option>
                        <option value="CCTV">CCTV</option>
                        <option value="DVR/NVR">DVR/NVR</option>
                        <option value="POS">POS</option>
                        <option value="Tablet">Tablet</option>
                        <option value="Software">Software</option>
                        <option value="Correo">Correo</option>
                    </select>
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
                <div className="mb-3">
                    <label className="form-label">Estado físico</label>
                    <input type="text" className="form-control" name="physical_status" value={form.physical_status} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Área</label>
                    <input type="text" className="form-control" name="area" value={form.area} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Problemas recurrentes</label>
                    <input type="text" className="form-control" name="recurring_issues" value={form.recurring_issues} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Nivel de conocimiento</label>
                    <input type="text" className="form-control" name="knowledge_level" value={form.knowledge_level} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Soporte actual (persona)</label>
                    <input type="text" className="form-control" name="support_person" value={form.support_person} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Tiempo de soporte</label>
                    <input type="text" className="form-control" name="support_time" value={form.support_time} onChange={handleChange} />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <button type="submit" className="btn btn-primary">Agregar</button>
            </form>
        </div>
    );
};
