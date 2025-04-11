import React, { useState, useEffect, useRef } from "react";
import Axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { AllowedAccess } from 'react-permission-role';
import NoPermission from "./NoPermission";
import "../style/empleado.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function ReporteVentasPlatillo() {
    const [ventas, setVentas] = useState([]);
    const [ventasFiltradas, setVentasFiltradas] = useState([]);
    const [search, setSearch] = useState("");
    const [sortColumn, setSortColumn] = useState("total_ventas");
    const [sortOrder, setSortOrder] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const reportRef = useRef(); // Ref para el contenedor de la tabla

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const response = await Axios.get("http://localhost:3001/reporte/ventas-por-platillo");
                setVentas(response.data.reporte);
                setVentasFiltradas(response.data.reporte); // Inicializamos con todos los datos
            } catch (error) {
                console.error("Error al obtener ventas por platillos:", error);
            }
        };

        fetchVentas();
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(ventasFiltradas.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    // Función de búsqueda que filtra las ventas
    const handleSearch = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        setSearch(searchTerm);

        // Filtra las ventas según todos los campos
        const filtered = ventas.filter(
            (venta) =>
                venta.nombre_platillo.toLowerCase().includes(searchTerm) || 
                venta.cantidad_vendida.toString().includes(searchTerm) ||
                venta.total_ventas.toString().includes(searchTerm)
        );
        setVentasFiltradas(filtered);
        setCurrentPage(1); // Resetear a la primera página después de buscar
    };

    // Función para ordenar las columnas
    const handleSort = (column) => {
        const newSortOrder = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
        setSortColumn(column);
        setSortOrder(newSortOrder);

        const sortedData = [...ventasFiltradas].sort((a, b) => {
            if (newSortOrder === "asc") {
                return a[column] > b[column] ? 1 : -1;
            } else {
                return a[column] < b[column] ? 1 : -1;
            }
        });

        setVentasFiltradas(sortedData);
    };

    const currentSortedItems = ventasFiltradas.slice(indexOfFirstItem, indexOfLastItem);

    // ** Llamada a generarPDF con título y descripción como cadenas de texto **
    const titulo = "Informe de Usuarios"; // Título como cadena
    const descripcion = "Este reporte muestra el total usuarios en el sistema."; // Descripción como cadena
    const contenidoTabla = "Contenido de la tabla"; // Agrega el contenido que desees para la tabla

    const generarPDF = (titulo, descripcion, contenidoTabla) => {
        const input = reportRef.current;

        // Verificar si el ref es válido
        if (!input) {
            console.error("Referencia al elemento no válida.");
            return;
        }

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
            pdf.text("Página: 1", 180, margenSuperior + 25); // Número de página

            // Agregar la imagen de la tabla, respetando los márgenes
            pdf.addImage(imgData, "PNG", margenIzquierdo, margenSuperior + 30, imgWidth, canvas.height * imgWidth / canvas.width);

            // Generar la vista previa del PDF (en lugar de descarga directa)
            const previewBlob = pdf.output('blob');
            const url = URL.createObjectURL(previewBlob);

            // Abrir la vista previa en una nueva ventana
            const previewWindow = window.open(url, '_blank');

            // Después de cargar la ventana de vista previa, podemos permitir al usuario imprimir o descargar
            previewWindow.onload = () => {
                previewWindow.print(); // Esto abrirá el cuadro de diálogo de impresión automáticamente, si lo prefieres.
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
                <h1>Reporte de Ventas por Platillo</h1>
                <br />
                <div className="d-flex justify-content-end mb-4">
                    <div className="search-container">
                        <input
                            type="text"
                            value={search}  
                            onChange={handleSearch} // Llama a la función de búsqueda
                            className="search-input"
                            placeholder="Buscar por nombre, cantidad o total"
                        />
                    </div>
                </div>
                <div ref={reportRef}>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col" onClick={() => handleSort("nombre_platillo")}>
                                    Nombre Platillo {sortColumn === "nombre_platillo" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                                </th>
                                <th scope="col" onClick={() => handleSort("cantidad_vendida")}>
                                    Cantidad Vendida {sortColumn === "cantidad_vendida" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                                </th>
                                <th scope="col" onClick={() => handleSort("total_ventas")}>
                                    Total Ventas {sortColumn === "total_ventas" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentSortedItems.map((venta, index) => (
                                <tr key={index}>
                                    <td>{venta.nombre_platillo}</td>
                                    <td>{venta.cantidad_vendida}</td>
                                    <td>{venta.total_ventas}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="d-flex justify-content-center mb-4">
                    <ul className="pagination">
                        {pageNumbers.map((number) => (
                            <li key={number} className="page-item">
                                <button
                                    onClick={() => paginate(number)}
                                    className={`page-link ${currentPage === number ? "active" : ""}`}
                                >
                                    {number}
                                </button>
                            </li>
                        ))}
                    </ul>
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

export default ReporteVentasPlatillo;
