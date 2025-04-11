import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../style/cocina.css'; 
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { Modal, Button } from 'react-bootstrap'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'; 

const Cocina = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [modalShow, setModalShow] = useState(false);
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

    useEffect(() => {
        const fetchOrdenes = async () => {
            try {
                const response = await axios.get("http://localhost:3001/orden/ordenes-preparando");
                setOrdenes(response.data.ordenes);
            } catch (error) {
                console.error("Error al cargar órdenes:", error);
            }
        };

        fetchOrdenes();

        const intervalId = setInterval(() => {
            fetchOrdenes();
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const marcarComoListo = async (ordenId) => {
        try {
            const response = await axios.post(`http://localhost:3001/orden/responder-orden/${ordenId}`);
            if (response.data.success) {
                setOrdenes(ordenes.filter(orden => orden.ordenId !== ordenId));
            }
        } catch (error) {
            console.error("Error al marcar la orden como lista:", error);
        }
    };

    const handleClose = () => {
        setModalShow(false);
        setOrdenSeleccionada(null);
    };

    return (
        <div className="container-fluid cocina-container">
            <div className="row">
                <div className="col-md-12">
                    <h2 className="text-center my-4">Órdenes Activas</h2>
                    <div className="row">
                        {ordenes.map((orden) => (
                            <div key={orden.ordenId} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                                <div className="orden-card card h-100 custom-card">
                                    <div className="card-body">
                                        <div className="orden-header d-flex justify-content-between align-items-center">
                                            <p className="card-title small">Usuario: {orden.usuarioId} - Mesa: {orden.mesaId}</p>
                                        </div>
                                        <h5 className="card-number text-center mb-3">Orden No: {orden.ordenId}</h5>
                                        <div className="items-list">
                                            <div className="items-scroll">
                                                <table className="table table-sm table-bordered">
                                                    <thead className="thead-fixed">
                                                        <tr>
                                                            <th>Platillo</th>
                                                            <th>Cantidad</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orden.items.map((item, index) => (
                                                            <tr key={index}>
                                                                <td>{item.nombre}</td>
                                                                <td>{item.cantidad}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-footer">
                                        <Button 
                                            className="btn btn-mark-as-done"
                                            onClick={() => marcarComoListo(orden.ordenId)}
                                        >
                                            <FontAwesomeIcon icon={faCheckCircle} /> Marcar como Listo
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Modal show={modalShow} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles de la Orden</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {ordenSeleccionada && (
                        <div>
                            <h4>Mesa: {ordenSeleccionada.mesaId}</h4>
                            <p>Usuario: {ordenSeleccionada.usuarioId}</p>
                            <h5>Items:</h5>
                            <ul>
                                {ordenSeleccionada.items.map((item, index) => (
                                    <li key={index}>{item.nombre} - Cantidad: {item.cantidad}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Cocina;
