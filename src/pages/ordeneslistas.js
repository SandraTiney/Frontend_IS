import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';  // Importamos SweetAlert2
import '../style/ordeneslistas.css';

const OrdenesListas = () => {
    const [ordenes, setOrdenes] = useState([]);
    
    useEffect(() => {
        // Obtener las órdenes "Listo" desde el backend
        axios.get('http://localhost:3001/orden/ordenes-listo')
            .then(response => {
                if (response.data.success) {
                    setOrdenes(response.data.ordenes);
                } else {
                    console.error('Error al cargar las órdenes');
                }
            })
            .catch(error => {
                console.error('Error en la solicitud:', error);
            });
    }, []);

    const handleEntregado = (ordenId) => {
        // Hacer la solicitud POST para actualizar el estado de la orden
        axios.post(`http://localhost:3001/orden/entregar-orden/${ordenId}`)
            .then(response => {
                if (response.data.success) {
                    // Mostrar SweetAlert con el ID de la orden y mensaje de "Entregado"
                    Swal.fire({
                        title: '¡Orden Entregada!',
                        text: `La orden ${ordenId} ha sido entregada.`,
                        icon: 'success',
                        confirmButtonText: 'Cerrar'
                    });

                    // Actualizar el estado local para reflejar el cambio
                    setOrdenes(prevOrdenes =>
                        prevOrdenes.filter(orden => orden.ordenId !== ordenId)
                    );
                } else {
                    console.error('Error al entregar la orden');
                }
            })
            .catch(error => {
                console.error('Error al hacer la solicitud de entrega:', error);
            });
    };

    return (
        <div className="ordenes-container">
            <h2 className="ordenes-title">Órdenes Listas</h2>
            <Table className="ordenes-table" striped bordered hover responsive>
                <thead>
                    <tr className="ordenes-table-header">
                        <th>Orden ID</th>
                        <th>Fecha de Orden</th>
                        <th>Mesa</th>
                        <th>Total</th>
                        <th>Platillos</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {ordenes.map(orden => (
                        <tr key={orden.ordenId}>
                            <td>{orden.ordenId}</td>
                            <td>{new Date(orden.fechaOrden).toLocaleString()}</td>
                            <td>{orden.mesaId}</td>
                            <td>Q. {parseFloat(orden.total).toFixed(2)}</td>
                            <td>
                                <ul>
                                    {orden.items.map(item => (
                                        <li key={item.detalleId}>
                                            {item.nombre} x {item.cantidad} (Q. {parseFloat(item.subtotal).toFixed(2)})
                                        </li>
                                    ))}
                                </ul>
                            </td>
                            <td>
                                <Button 
                                    className="entregado-btn" 
                                    onClick={() => handleEntregado(orden.ordenId)}
                                    disabled={orden.estado === 'entregado'}
                                >
                                    {orden.estado === 'entregado' ? 'Entregada' : 'Entregar'}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default OrdenesListas;
