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

    return (
        <div className="container mt-5">
            <h2>Inventario de Artículos</h2>
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
                                item && (
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
                                )
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
