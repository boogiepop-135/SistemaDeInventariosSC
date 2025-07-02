import React, { useEffect, useState } from "react";

export const Inventario = () => {
    const [articulos, setArticulos] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchArticulos = async () => {
            try {
                let backendUrl = import.meta.env.VITE_BACKEND_URL;
                if (backendUrl.endsWith("/")) backendUrl = backendUrl.slice(0, -1);
                const url = `${backendUrl}/api/items`;
                const token = localStorage.getItem("token");
                const resp = await fetch(url, {
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                });
                if (!resp.ok) throw new Error("No se pudo obtener el inventario");
                const data = await resp.json();
                setArticulos(data);
            } catch (err) {
                setError("Error al cargar el inventario");
            }
        };
        fetchArticulos();
    }, []);

    const handleExport = async () => {
        let backendUrl = import.meta.env.VITE_BACKEND_URL;
        if (backendUrl.endsWith("/")) backendUrl = backendUrl.slice(0, -1);
        const token = localStorage.getItem("token");
        const resp = await fetch(`${backendUrl}/api/items/export`, {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!resp.ok) return alert("No se pudo descargar el inventario");
        const blob = await resp.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "inventario.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="container mt-5">
            <h2>Inventario de Artículos</h2>
            <button className="btn btn-success mb-3" onClick={handleExport}>
                Descargar Excel
            </button>
            {error && <div className="alert alert-danger">{error}</div>}
            {articulos.length === 0 && !error && (
                <p>No hay artículos en el inventario.</p>
            )}
            {articulos.length > 0 && (
                <div className="table-responsive">
                    <table className="table table-bordered table-striped mt-3">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Marca</th>
                                <th>Modelo</th>
                                <th>Color</th>
                                <th>Características</th>
                                <th>Garantía</th>
                                <th>Manual</th>
                                <th>Estado</th>
                                <th>Asignado a</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articulos.map(item => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.type}</td>
                                    <td>{item.brand}</td>
                                    <td>{item.model}</td>
                                    <td>{item.color}</td>
                                    <td>{item.features}</td>
                                    <td>{item.warranty_date}</td>
                                    <td>{item.manual ? "Sí" : "No"}</td>
                                    <td>{item.status}</td>
                                    <td>{item.assigned_to}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
