import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Inventario = () => {
    const [articulos, setArticulos] = useState([]);
    const [error, setError] = useState("");
    const [modalImage, setModalImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchArticulos = async () => {
            try {
                let backendUrl = import.meta.env.VITE_BACKEND_URL;
                if (!backendUrl) throw new Error("VITE_BACKEND_URL no está definido");
                if (backendUrl.endsWith("/")) backendUrl = backendUrl.slice(0, -1);
                const url = `${backendUrl}/api/items`;
                console.log("URL de la API:", url);

                const token = localStorage.getItem("token");
                console.log("Token:", token ? "Presente" : "Ausente");

                const resp = await fetch(url, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                console.log("Estado de la respuesta:", resp.status);

                if (!resp.ok) throw new Error(`Error ${resp.status}: ${await resp.text()}`);
                const data = await resp.json();
                console.log("Datos recibidos:", data);
                setArticulos(data);
            } catch (err) {
                console.error("Error detallado:", err.message);
                setError(`Error al cargar el inventario: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchArticulos();
    }, []);

    const handleImageClick = (imageUrl, e) => {
        e.stopPropagation(); // Evita que se active la fila
        setModalImage(imageUrl);
    };

    const handleRowClick = (item) => {
        setSelectedItem(item);
    };

    const closeModal = () => {
        setSelectedItem(null);
    };

    if (loading) return <div className="container mt-5">Cargando inventario...</div>;

    return (
        <div className="container mt-5">
            <h2>Inventario de Artículos</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {articulos.length === 0 && !error && (
                <p>No hay artículos en el inventario.</p>
            )}
            {articulos.length > 0 && (
                <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>Imagen</th>
                                <th>Categoría</th>
                                <th>Marca</th>
                                <th>Modelo</th>
                                <th>Número de Serie</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articulos.map(item => (
                                <tr key={item.id} onClick={() => handleRowClick(item)} style={{ cursor: 'pointer' }}>
                                    <td style={{ width: "100px" }}>
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt="Imagen"
                                                className="img-thumbnail"
                                                style={{ height: "60px", cursor: "pointer" }}
                                                onClick={(e) => handleImageClick(item.image_url, e)}
                                            />
                                        ) : (
                                            <span className="text-muted">Sin imagen</span>
                                        )}
                                    </td>
                                    <td>{item.category}</td>
                                    <td>{item.brand}</td>
                                    <td>{item.model}</td>
                                    <td>{item.serial}</td>
                                    <td>
                                        <span className={`badge bg-${item.status === 'asignado' ? 'success' : 'primary'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal para imagen ampliada */}
            {modalImage && (
                <div
                    className="modal show d-block"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setModalImage(null)}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setModalImage(null)}
                                ></button>
                            </div>
                            <div className="modal-body p-0">
                                <img
                                    src={modalImage}
                                    alt="Vista ampliada"
                                    className="img-fluid w-100"
                                    style={{ maxHeight: '80vh', objectFit: 'contain' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para detalles del item */}
            {selectedItem && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Detalles del Artículo</h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        {selectedItem.image_url && (
                                            <img
                                                src={selectedItem.image_url}
                                                alt={selectedItem.name}
                                                className="img-fluid mb-3"
                                                style={{ maxHeight: '300px' }}
                                            />
                                        )}
                                        <h4>{selectedItem.name}</h4>
                                        <p><strong>Categoría:</strong> {selectedItem.category}</p>
                                        <p><strong>Marca:</strong> {selectedItem.brand}</p>
                                        <p><strong>Modelo:</strong> {selectedItem.model}</p>
                                        <p><strong>Número de Serie:</strong> {selectedItem.serial}</p>
                                        <p>
                                            <strong>Estado:</strong>
                                            <span className={`badge ms-2 bg-${selectedItem.status === 'asignado' ? 'success' : 'primary'}`}>
                                                {selectedItem.status}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="col-md-6">
                                        <h5>Información Adicional</h5>
                                        <p><strong>Descripción:</strong> {selectedItem.description || 'N/A'}</p>
                                        <p><strong>Asignado a:</strong> {selectedItem.assigned_to || 'No asignado'}</p>
                                        <p><strong>Estado físico:</strong> {selectedItem.physical_status || 'N/A'}</p>
                                        <p><strong>Área:</strong> {selectedItem.area || 'N/A'}</p>
                                        <p><strong>Fecha de garantía:</strong> {selectedItem.warranty_date || 'N/A'}</p>
                                        <p><strong>Características:</strong> {selectedItem.features || 'N/A'}</p>
                                        <p><strong>Comentarios:</strong> {selectedItem.recurring_issues || 'Sin comentarios'}</p>
                                        <p><strong>Manual:</strong> {selectedItem.manual ? 'Disponible' : 'No disponible'}</p>
                                        <p><strong>Documentación:</strong> No disponible</p>
                                        <p><strong>Último mantenimiento:</strong> No registrado</p>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};