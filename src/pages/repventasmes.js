import React, { useState, useEffect, useRef } from "react";
import Axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { AllowedAccess } from 'react-permission-role';
import NoPermission from "./NoPermission";
import "../style/empleado.css";

    function ReporteVentasPorMes() {
        const [ventas, setVentas] = useState([]);
        const [ventasFiltradas, setVentasFiltradas] = useState([]);
        const [search, setSearch] = useState("");
        const reportRef = useRef();
        const [currentPage, setCurrentPage] = useState(1);
        const [itemsPerPage] = useState(15); // Cambiar el número de elementos por página si es necesario


        useEffect(() => {
            const fetchVentas = async () => {
                try {
                    const response = await Axios.get("http://localhost:3001/reporte/ventas-por-mes");
                    setVentas(response.data.reporte);
                    setVentasFiltradas(response.data.reporte); // Inicializamos con todos los datos
                } catch (error) {
                    console.error("Error al obtener ventas por mes:", error);
                }
            };
    
            fetchVentas();
        }, []);


// Función para manejar la búsqueda por texto
const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);

    // Filtra las ventas según el campo 'anio' y 'mes'
    const filtered = ventas.filter(
        (venta) =>
            `${venta.anio}-${venta.mes}`.toLowerCase().includes(searchTerm)
    );
    setVentasFiltradas(filtered);
};

// Función para ordenar los datos por fecha
const handleSort = () => {
    const sorted = [...ventasFiltradas].sort((a, b) => {
        if (a.anio === b.anio) {
            return a.mes - b.mes;
        }
        return a.anio - b.anio;
    });
    setVentasFiltradas(sorted);
};

    // Función para manejar la paginación
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const totalPages = Math.ceil(ventasFiltradas.length / itemsPerPage);
    const currentData = ventasFiltradas.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }


    // ** Llamada a generarPDF con título y descripción como cadenas de texto **
    const titulo = "Informe de Ventas por Mesa"; // Título como cadena
    const descripcion = "Este reporte muestra el total de ventas por cada mesa en el sistema."; // Descripción como cadena
    
    const contenidoTabla = ventasFiltradas.map(venta => 
        `Mesa: ${venta.numero_mesa}, Total Ventas: ${parseFloat(venta.total_ventas).toFixed(2)}`
    ).join('\n'); // Crear contenido dinámico para la tabla

    const generarPDF = (titulo, descripcion, contenidoTabla) => {
        const input = reportRef.current;

        // Definir márgenes (en mm)
        const margenIzquierdo = 14;
        const margenSuperior = 20;
        const margenDerecho = 14;
        const margenInferior = 14;

        // Ancho de la página A4
        const imgWidth = 210 - margenIzquierdo - margenDerecho; // Ancho total menos márgenes

        // Generar la imagen del contenido de la tabla usando html2canvas
        html2canvas(input, {
            margin: { top: margenSuperior, left: margenIzquierdo, right: margenDerecho, bottom: margenInferior }
        }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF();

            // Cambiar el color del título a naranja
            pdf.setTextColor(255, 165, 0); // RGB para el color naranja
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text(String(titulo), margenIzquierdo, margenSuperior); // Título dinámico como string

            // Descripción debajo del título
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text(String(descripcion), margenIzquierdo, margenSuperior + 10); // Descripción dinámica como string

            // Línea separadora debajo de la descripción
            pdf.setLineWidth(0.5);
            pdf.line(margenIzquierdo, margenSuperior + 12, 196 - margenDerecho, margenSuperior + 12);  // Línea horizontal

            // Fecha de generación y número de página
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const fechaGeneracion = new Date().toLocaleDateString(); // formato dd/mm/yyyy
            pdf.text("Fecha de generación: " + fechaGeneracion, margenIzquierdo, margenSuperior + 25);
            pdf.text("Página: " + pdf.internal.getNumberOfPages(), 180, margenSuperior + 25); // Número de página dinámico

            // Agregar la imagen de la tabla, respetando los márgenes
            pdf.addImage(imgData, "PNG", margenIzquierdo, margenSuperior + 30, imgWidth, canvas.height * imgWidth / canvas.width);
            
            // Generar la vista previa del PDF (en lugar de descarga directa)
            const previewBlob = pdf.output('blob');
            const url = URL.createObjectURL(previewBlob);
            
            // Abrir la vista previa en una nueva ventana
            const previewWindow = window.open(url, '_blank');

            // Después de cargar la ventana de vista previa, podemos permitir al usuario imprimir o descargar
            previewWindow.onload = () => {
                previewWindow.print(); // Esto abrirá el cuadro de diálogo de impresión automáticamente
            };

            // Si prefieres permitir que el usuario descargue el archivo manualmente, descomenta esta línea
            // pdf.save('reporte_ventas_por_mesa.pdf');
        });
    };

    return (
        <AllowedAccess 
            roles={["admin"]} 
            permissions="manage-users" 
            renderAuthFailed={<NoPermission />}
            isLoading={<p>Cargando...</p>}
        >
            <div className="container">
                <h1>Informe de Ventas por Mes</h1>
                <br />
                <div className="d-flex justify-content-between mb-4">
                    <div className="search-container">
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearch} // Llama a la función de búsqueda
                            className="search-input"
                            placeholder="Buscar (ej. 2023-05)"
                        />
                    </div>

                    <button className="btn btn-secondary" onClick={handleSort}>
                        Ordenar por fecha
                    </button>
                </div>

                <div ref={reportRef}>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">Año-Mes</th>
                                <th scope="col">Total Ventas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((venta, index) => (
                                <tr key={index}>
                                    <td>{`${venta.anio}-${String(venta.mes).padStart(2, '0')}`}</td>
                                    <td>{Number(venta.total_ventas).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {/* Paginación */}
            <div className="d-flex justify-content-center">
                <nav>
                    <ul className="pagination">
                        {[...Array(Math.ceil(ventasFiltradas.length / itemsPerPage))].map((_, index) => (
                            <li
                                key={index}
                                className={`page-item ${index + 1 === currentPage ? "active" : ""}`}
                            >
                                <button
                                    className="page-link"
                                    onClick={() => paginate(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
                <div className="d-flex justify-content-end">
                <button className="btn btn-primary" onClick={() => generarPDF(titulo, descripcion, contenidoTabla)}>
                        Generar PDF
                    </button>
                </div>
            </div>
        </AllowedAccess>
    );
}

export default ReporteVentasPorMes;
