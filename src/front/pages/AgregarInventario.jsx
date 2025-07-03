import React, { useState } from "react";

const tipos = [
    "laptop", "pc", "monitor", "proyector", "control", "cable hdmi", "display port", "periferico mouse o teclado"
];

const campos = [
    { name: "name", label: "Nombre *", type: "text", required: true },
    { name: "description", label: "Descripción", type: "text" },
    {
        name: "category", label: "Categoría *", type: "select", required: true, options: [
            "PC", "Laptop", "Periférico", "Impresora", "Escáner", "Switch", "Router", "Access Point", "Cableado", "CCTV", "DVR/NVR", "POS", "Tablet", "Teléfono móvil", "Software", "Correo"
        ]
    },
    { name: "type", label: "Tipo *", type: "select", required: true, options: tipos },
    { name: "brand", label: "Marca", type: "text" },
    { name: "model", label: "Modelo", type: "text" },
    { name: "color", label: "Color", type: "text" },
    { name: "features", label: "Características", type: "text" },
    { name: "warranty_date", label: "Fecha de garantía", type: "date" },
    { name: "manual", label: "Manual en existencia", type: "checkbox" },
    { name: "status", label: "Estado", type: "select", options: ["stock", "asignado"] },
    { name: "assigned_to", label: "Asignado a", type: "text" },
    { name: "physical_status", label: "Estado físico", type: "text" },
    { name: "area", label: "Área", type: "text" },
    { name: "recurring_issues", label: "Problemas recurrentes", type: "text" },
    { name: "knowledge_level", label: "Nivel de conocimiento", type: "text" },
    { name: "support_person", label: "Soporte actual (persona)", type: "text" },
    { name: "support_time", label: "Tiempo de soporte", type: "text" }
];

export const AgregarInventario = () => {
    const [form, setForm] = useState(
        campos.reduce((acc, c) => ({ ...acc, [c.name]: c.type === "checkbox" ? false : "" }), {})
    );
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
        for (let c of campos) {
            if (c.required && !form[c.name]) {
                setError(`Falta el campo requerido: ${c.label.replace("*", "")}`);
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
            setForm(campos.reduce((acc, c) => ({ ...acc, [c.name]: c.type === "checkbox" ? false : "" }), {}));
        } catch (err) {
            setError("Error de conexión con el backend");
        }
    };

    return (
        <div className="container mt-5">
            <h2>Agregar al Inventario</h2>
            <form onSubmit={handleSubmit} className="mt-4">
                {campos.map(c => (
                    <div className="mb-3" key={c.name}>
                        {c.type === "select" ? (
                            <>
                                <label className="form-label">{c.label}</label>
                                <select
                                    className="form-select"
                                    name={c.name}
                                    value={form[c.name]}
                                    onChange={handleChange}
                                >
                                    <option value="">Selecciona {c.label.replace("*", "").toLowerCase()}</option>
                                    {c.options.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </>
                        ) : c.type === "checkbox" ? (
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name={c.name}
                                    checked={form[c.name]}
                                    onChange={handleChange}
                                    id={c.name}
                                />
                                <label className="form-check-label" htmlFor={c.name}>
                                    {c.label}
                                </label>
                            </div>
                        ) : (
                            <>
                                <label className="form-label">{c.label}</label>
                                <input
                                    type={c.type}
                                    className="form-control"
                                    name={c.name}
                                    value={form[c.name]}
                                    onChange={handleChange}
                                />
                            </>
                        )}
                    </div>
                ))}
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <button type="submit" className="btn btn-primary">Agregar</button>
            </form>
        </div>
    );
};
                    <label className="form-label">Marca</label>
                    <input type="text" className="form-control" name="brand" value={form.brand} onChange={handleChange} />
                </div >
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
{ error && <div className="alert alert-danger">{error}</div> }
{ success && <div className="alert alert-success">{success}</div> }
<button type="submit" className="btn btn-primary">Agregar</button>
            </form >
        </div >
    );
};
<input type="text" className="form-control" name="physical_status" value={form.physical_status} onChange={handleChange} />
                </div >
    <div className="mb-3">
        <label className="form-label">Área</label>
        <input type="text" className="form-control" name="area" value={form.area} onChange={handleChange} />
    </div>
{/* <div className="mb-3">
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
                </div> */}
<div className="mb-3">
    <label className="form-label">Foto del artículo</label>
    <input
        type="file"
        className="form-control"
        name="image"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        ref={fileInputRef}
    />
    {preview && (
        <div className="mt-2">
            <img src={preview} alt="preview" style={{ maxWidth: 200, maxHeight: 200 }} />
        </div>
    )}
</div>
{ error && <div className="alert alert-danger">{error}</div> }
{ success && <div className="alert alert-success">{success}</div> }
<button type="submit" className="btn btn-primary">Agregar</button>
            </form >
        </div >
    );
};
