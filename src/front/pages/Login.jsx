import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Login = () => {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = e => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        let backendUrl = import.meta.env.VITE_BACKEND_URL;
        if (backendUrl.endsWith("/")) backendUrl = backendUrl.slice(0, -1);
        const url = `${backendUrl}/api/login`;
        try {
            const resp = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            const data = await resp.json();
            if (!resp.ok) {
                setError(data.msg || "Error de autenticación");
                return;
            }
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("username", form.username);
            navigate("/inventario");
        } catch {
            setError("Error de conexión con el backend");
        }
    };

    return (
        <div className="container mt-5">
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleSubmit} className="mt-4" style={{ maxWidth: 400, margin: "0 auto" }}>
                <div className="mb-3">
                    <label className="form-label">Usuario</label>
                    <input type="text" className="form-control" name="username" value={form.username} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Contraseña</label>
                    <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button type="submit" className="btn btn-primary w-100">Entrar</button>
            </form>
        </div>
    );
};
 