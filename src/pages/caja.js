import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AllowedAccess } from 'react-permission-role';
import NoPermission from "./NoPermission";
import "../style/caja.css";

const Caja = () => {
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]); // Fecha inicial
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/caja/arqueo-caja/${fecha}`);
                
                // Asegúrate de que la respuesta tenga la estructura esperada
                if (response.data && response.data.ordenes && response.data.ordenes.length > 0) {
                    setData(response.data);
                } else {
                    console.log("Fecha no existe o no hay órdenes.");
                    setData({ ordenes: [], totalOrdenes: 0 }); // Establecer un objeto vacío para evitar errores en el renderizado
                }
            } catch (err) {
                console.error(err.response ? err.response.data.message : "Error al obtener datos");
            } 
        };
        fetchData();
    }, [fecha]);

    const handleFechaChange = (event) => {
        setFecha(event.target.value); 
    };
    const titulo = "Informe de Arqueo de caja diarias"; 
    const descripcion = "Este reporte muestra el total ventas diarias de todos los meseros."; 

    const generatePDF = (titulo, descripcion) => {
        const input = document.getElementById('reporte');
        const margenIzquierdo = 14;
        const margenSuperior = 20;
        const margenDerecho = 14;
        
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'legal'
            });
            
            const imgWidth = 215.9 - margenIzquierdo - margenDerecho;
            
            // Agregar el encabezado personalizado
            pdf.setTextColor(255, 165, 0);
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text(String(titulo), margenIzquierdo, margenSuperior);
    
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text(String(descripcion), margenIzquierdo, margenSuperior + 10);
    
            pdf.setLineWidth(0.5);
            pdf.line(margenIzquierdo, margenSuperior + 12, 196 - margenDerecho, margenSuperior + 12);
    
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const fechaGeneracion = new Date().toLocaleDateString();
            pdf.text("Fecha de Informe Generado: " + fechaGeneracion, 118, margenSuperior + 25);
    
         
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let position = margenSuperior + 30; 
    
     
            const pageHeight = pdf.internal.pageSize.height;
            let heightLeft = imgHeight;
    
            
            pdf.addImage(imgData, 'PNG', margenIzquierdo, position, imgWidth, imgHeight);
            heightLeft -= (pageHeight - position);
    
           
            while (heightLeft >= 0) {
                pdf.addPage();
                pdf.addImage(
                    imgData,
                    'PNG',
                    margenIzquierdo,
                    -(pageHeight - position),
                    imgWidth,
                    imgHeight
                );
                heightLeft -= pageHeight;
            }
    
            pdf.save(`arqueo_caja_${fechaGeneracion.replace(/\//g, '-')}.pdf`);
        });
    };

    const totalVentasCalculated = data && data.ordenes ? data.ordenes.reduce((total, orden) => total + Number(orden.total), 0) : 0;

    return (
        <AllowedAccess roles={["admin"]} permissions="manage-users" renderAuthFailed={<NoPermission />} isLoading={<p>Cargando...</p>}>
            <div className='caja-container'>
                <div className='header'>
                    <h1 className='title'>Arqueo de Caja</h1>
                    <br />
                    <div className='headers-controls'>
                        <label htmlFor="fecha">Ingresa una fecha:</label>
                        <input
                            type="date"
                            value={fecha}
                            onChange={handleFechaChange}
                            className="search-input"
                            placeholder="Buscar"
                        />
                        <div className="d-flex justify-content-end">
                            <button className="btn btn-primary" onClick={() => generatePDF(titulo, descripcion)}>
                                Generar PDF
                            </button>
                        </div>
                    </div>
                </div>
                <hr />
                <div id="reporte">
                    {data ? (
                        <>
                            <div className='summary-card'>
                                <p>Arqueo de Caja - {fecha}</p>
                            </div>
                            <div className='summary-card'>
                                <p>Total Ventas: Q {totalVentasCalculated}</p>
                            </div>
                            <div className='summary-card'>
                                <p>Total Órdenes: {data.totalOrdenes || 0}</p>
                            </div>

                            <h3>Órdenes</h3>
                            {data.ordenes && data.ordenes.length > 0 ? (
                                <ul>
                                    {data.ordenes.map(orden => (
                                        <div className="order-card" key={orden.ordenId}>
                                            <div className="order-header">
                                                <span className="order-id">Orden ID: {orden.ordenId}</span>
                                                <span className="order-total">Q {orden.total}</span>
                                            </div>
                                            <ul className="order-items">
                                                {orden.items.map(item => (
                                                    <li key={item.platilloId}>
                                                        {item.nombrePlatillo} - Cantidad: {item.cantidad}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </ul>
                            ) : (
                                <p>No hay órdenes disponibles para esta fecha.</p> // Mensaje si no hay órdenes
                            )}
                        </>
                    ) : (
                        <p>No se encontraron datos para la fecha seleccionada.</p> // Mensaje si no hay datos
                    )}
                    
                    <div className="total-container">
                        <p>Total de todas las órdenes</p>
                        <p className="grand-total">Q {totalVentasCalculated}</p>
                    </div>
                </div>
            </div>
        </AllowedAccess>
    );
};

export default Caja;