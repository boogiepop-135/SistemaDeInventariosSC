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
  { name: "area", label: "Área", type: "text" }
];

export const AgregarInventario = () => {
  const [form, setForm] = useState(
    campos.reduce((acc, c) => ({ ...acc, [c.name]: c.type === "checkbox" ? false : "" }), {})
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState("");

  const handleChange = e => {
    const { name, value, type: inputType, checked } = e.target;
    setForm({
      ...form,
      [name]: inputType === "checkbox" ? checked : value
    });
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(currentForm => ({
          ...currentForm,
          image: reader.result // Guardar imagen como string base64
        }));
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No hay sesión activa");
      return;
    }

    try {
      let backendUrl = import.meta.env.VITE_BACKEND_URL;
      if (backendUrl.endsWith("/")) backendUrl = backendUrl.slice(0, -1);

      const resp = await fetch(`${backendUrl}/api/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      console.log("Status:", resp.status);
      const data = await resp.json();
      console.log("Respuesta:", data);

      if (!resp.ok) {
        throw new Error(data.message || "Error al agregar artículo");
      }

      setSuccess("Artículo agregado correctamente");
      setForm(campos.reduce((acc, c) => ({
        ...acc,
        [c.name]: c.type === "checkbox" ? false : ""
      }), {}));
      setPreview("");

    } catch (err) {
      console.error("Error:", err);
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

        <div className="mb-3">
          <label className="form-label">Foto del artículo</label>
          <input
            type="file"
            className="form-control"
            name="image"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
          />
          {preview && (
            <div className="mt-2">
              <img src={preview} alt="preview" style={{ maxWidth: 200, maxHeight: 200 }} />
            </div>
          )}
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <button type="submit" className="btn btn-primary">Agregar</button>
      </form>
    </div>
  );
};