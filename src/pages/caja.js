import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AllowedAccess } from 'react-permission-role';
import NoPermission from "./NoPermission";
import "../style/caja.css";

const Caja = () => {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // Función para validar si la fecha es futura
  const isDateFuture = (dateStr) => {
    const selectedDate = new Date(dateStr);
    const today = new Date();
    // Solo comparar fechas sin horas
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return selectedDate > today;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (isDateFuture(fecha)) {
        setError("No se pueden mostrar datos de fechas futuras.");
        setData(null);
        return;
      }
      setError('');
      try {
        const response = await axios.get(`http://localhost:3001/caja/arqueo-caja/${fecha}`);
        if (response.data && response.data.ordenes && response.data.ordenes.length > 0) {
          setData(response.data);
        } else {
          setData({ ordenes: [], totalOrdenes: 0 });
        }
      } catch (err) {
        setError("Error al obtener datos.");
        setData(null);
      }
    };
    fetchData();
  }, [fecha]);

  const handleFechaChange = (event) => {
    const newFecha = event.target.value;
    if (isDateFuture(newFecha)) {
      alert("No puede seleccionar una fecha futura.");
      return;
    }
    setFecha(newFecha);
  };

  const titulo = "Informe de Arqueo de Caja Diaria";
  const descripcion = `Reporte de ventas y órdenes del día ${fecha}`;

  const generatePDF = () => {
    if (isDateFuture(fecha)) {
      alert("No se puede generar reporte para una fecha futura.");
      return;
    }
    const input = document.getElementById('reporte');
    if (!input) {
      alert("No hay datos para generar el reporte.");
      return;
    }

    const margenIzquierdo = 14;
    const margenSuperior = 20;
    const margenDerecho = 14;

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'legal',
      });

      const imgWidth = 215.9 - margenIzquierdo - margenDerecho;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Encabezado profesional
      pdf.setTextColor(40, 40, 40); // Gris oscuro
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(titulo, margenIzquierdo, margenSuperior);

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(descripcion, margenIzquierdo, margenSuperior + 10);

      pdf.setLineWidth(0.5);
      pdf.line(margenIzquierdo, margenSuperior + 12, 196 - margenDerecho, margenSuperior + 12);

      const fechaGeneracion = new Date().toLocaleDateString();
      pdf.text(`Fecha de Generación: ${fechaGeneracion}`, 140, margenSuperior + 10);

      let position = margenSuperior + 20;

      const pageHeight = pdf.internal.pageSize.height;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, 'PNG', margenIzquierdo, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - position);

      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margenIzquierdo, heightLeft - imgHeight + position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`arqueo_caja_${fecha.replace(/-/g, '')}.pdf`);
    });
  };

  const totalVentasCalculated = data && data.ordenes
    ? data.ordenes.reduce((total, orden) => total + Number(orden.total), 0)
    : 0;

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
              id="fechaCuadre"
              value={fecha}
              onChange={handleFechaChange}
              className="search-input"
              placeholder="Buscar"
              max={new Date().toISOString().split('T')[0]} // Impedir seleccionar fechas futuras con HTML
            />
            <div className="d-flex justify-content-end">
              <button className="btn btn-primary" onClick={generatePDF}>
                Generar PDF
              </button>
            </div>
          </div>
        </div>
        <hr />
        {error && <p className="error-message">{error}</p>}
        <div id="reporte">
          {data ? (
            <>
              <div className='summary-card'>
                <p>Arqueo de Caja - {fecha}</p>
              </div>
              <div className='summary-card'>
                <p>Total Ventas: Q {totalVentasCalculated.toFixed(2)}</p>
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
                        <span className="order-total">Q {(Number(orden.total) || 0).toFixed(2)}</span>
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
                <p>No hay órdenes disponibles para esta fecha.</p>
              )}
            </>
          ) : (
            <p>No se encontraron datos para la fecha seleccionada.</p>
          )}
          <div className="total-container">
            <p>Total de todas las órdenes</p>
            <p className="grand-total">Q {(Number(totalVentasCalculated) || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </AllowedAccess>
  );
};

export default Caja;
