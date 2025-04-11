import React, { useState, useEffect, useRef } from "react";
import Axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { AllowedAccess } from 'react-permission-role';
import NoPermission from "./NoPermission";
import "../style/empleado.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function ReporteVentasDiarias() {
    const [ventas, setVentas] = useState([]);
    const [ventasFiltradas, setVentasFiltradas] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState(null); 
    const [currentPage, setCurrentPage] = useState(1); // Página actual
    const [itemsPerPage] = useState(15); // Número de elementos por página
    const reportRef = useRef();

    useEffect(() => {
        const fetchVentas = async (startDate = null, endDate = null) => {
            try {
                const response = await Axios.get("http://localhost:3001/reporte/ventas-diarias", {
                    params: {
                        startDate: startDate ? startDate.toISOString().slice(0, 10) : undefined,
                        endDate: endDate ? endDate.toISOString().slice(0, 10) : undefined,
                    },
                });
                setVentas(response.data.reporte);
                setVentasFiltradas(response.data.reporte);
            } catch (error) {
                console.error("Error al obtener ventas diarias:", error);
            }
        };

        fetchVentas();
    }, []);

    // Función para manejar la búsqueda por texto
    const handleSearch = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        setSearch(searchTerm);

        const filtered = ventas.filter(
            (venta) =>
                venta.nombre_usuario.toLowerCase().includes(searchTerm)
        );
        setVentasFiltradas(filtered);
    };

    // Función para manejar la selección de fecha
    const handleDateChange = (date) => {
        setSelectedDate(date);
        if (date) {
            const formattedDate = date.toLocaleDateString();
            const filteredByDate = ventas.filter((venta) => {
                const fechaVenta = new Date(venta.fecha);
                return fechaVenta.toLocaleDateString() === formattedDate;
            });
            setVentasFiltradas(filteredByDate);
        } else {
            setVentasFiltradas(ventas); 
        }
    };

    // Función para formatear la fecha
    const formatearFecha = (fecha) => {
        const date = new Date(fecha);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // ** Llamada a generarPDF con título y descripción como cadenas de texto **
    const titulo = "Informe de Ventas diarias"; 
    const descripcion = "Este reporte muestra el total ventas diarias."; 
    const contenidoTabla = "Contenido de la tabla"; 
    
    const generarPDF = (titulo, descripcion, contenidoTabla) => {
        const input = reportRef.current;
        const margenIzquierdo = 14;
        const margenSuperior = 20;
        const margenDerecho = 14;
        const margenInferior = 14;
        const imgWidth = 210 - margenIzquierdo - margenDerecho;

        html2canvas(input, {
            margin: { top: margenSuperior, left: margenIzquierdo, right: margenDerecho, bottom: margenInferior }
        }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF();
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
            pdf.text("Fecha de generación: " + fechaGeneracion, margenIzquierdo, margenSuperior + 25);
            pdf.text("Página: 1", 180, margenSuperior + 25);

            pdf.addImage(imgData, "PNG", margenIzquierdo, margenSuperior + 30, imgWidth, canvas.height * imgWidth / canvas.width);

            const previewBlob = pdf.output('blob');
            const url = URL.createObjectURL(previewBlob);

            const previewWindow = window.open(url, '_blank');
            previewWindow.onload = () => {
                previewWindow.print();
            };
        });
    };

    // Función para paginar los datos
    const indexOfLastVenta = currentPage * itemsPerPage;
    const indexOfFirstVenta = indexOfLastVenta - itemsPerPage;
    const currentVentas = ventasFiltradas.slice(indexOfFirstVenta, indexOfLastVenta);

    // Función para manejar el cambio de página
    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= Math.ceil(ventasFiltradas.length / itemsPerPage)) {
            setCurrentPage(pageNumber);
        }
    };

    // Generar los números de página
    const totalPages = Math.ceil(ventasFiltradas.length / itemsPerPage);
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <AllowedAccess 
            roles={["admin"]} 
            permissions="manage-users" 
            renderAuthFailed={<NoPermission />}
            isLoading={<p>Cargando...</p>}
        >
            <div className="container">
                <h1>Informe de Ventas Diarias</h1>
                <br />
                <div className="d-flex justify-content-between mb-4">
                    <div className="search-container">
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearch}
                            className="search-input"
                            placeholder="Buscar por nombre de usuario"
                        />
                    </div>

                    <div>
                        <DatePicker
                            selected={selectedDate}
                            onChange={handleDateChange}
                            dateFormat="dd/MM/yyyy"
                            className="form-control"
                            placeholderText="  Selecciona una fecha"
                        />
                    </div>
                </div>

                <div ref={reportRef}>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">Fecha</th>
                                <th scope="col">Total Órdenes</th>
                                <th scope="col">Total Ventas</th>
                                <th scope="col">Nombre Usuario</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentVentas.map((venta, index) => (
                                <tr key={index}>
                                    <td>{formatearFecha(venta.fecha)}</td>
                                    <td>{venta.total_ordenes}</td>
                                    <td>{venta.total_ventas}</td>
                                    <td>{venta.nombre_usuario}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="d-flex justify-content-end">
                    <button className="btn btn-primary" onClick={() => generarPDF(titulo, descripcion, contenidoTabla)}>
                        Generar PDF
                    </button>
                </div>
                <nav>
                    <ul className="pagination">
                        {pageNumbers.map((number) => (
                            <li key={number} className="page-item">
                                <a
                                    href="#!"
                                    className="page-link"
                                    onClick={() => paginate(number)}
                                >
                                    {number}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </AllowedAccess>
    );
}

export default ReporteVentasDiarias;
