import React, { useState, useEffect, useRef } from "react";
import Axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../style/empleado.css";
import { AllowedAccess } from 'react-permission-role';
import NoPermission from "./NoPermission";


function ReporteVentasPorMesa() {
    const [ventasPorMesa, setVentasPorMesa] = useState([]);
    const [ventasFiltradas, setVentasFiltradas] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const reportRef = useRef();

    useEffect(() => {
        const fetchVentasPorMesa = async () => {
            try {
                const response = await Axios.get("http://localhost:3001/reporte/ventas-por-mesa");
                setVentasPorMesa(response.data.reporte);
                setVentasFiltradas(response.data.reporte);
            } catch (error) {
                console.error("Error al obtener ventas por mesa:", error);
            }
        };

        fetchVentasPorMesa();
    }, []);

    const handleSearch = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        setSearch(searchTerm);
        filtrarResultados(searchTerm);
    };

    const filtrarResultados = (searchTerm) => {
        const filtered = ventasPorMesa.filter((venta) => {
            const matchesSearch =
                venta.numero_mesa.toString().includes(searchTerm) ||
                venta.total_ventas.toString().includes(searchTerm) ||
                venta.anio.toString().includes(searchTerm) ||
                venta.mes.toString().includes(searchTerm);
            return matchesSearch;
        });
        setVentasFiltradas(filtered);
    };

    const handleSort = (column) => {
        const sortedData = [...ventasFiltradas].sort((a, b) => {
            if (a[column] < b[column]) return -1;
            if (a[column] > b[column]) return 1;
            return 0;
        });
        setVentasFiltradas(sortedData);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const totalPages = Math.ceil(ventasFiltradas.length / itemsPerPage);
    const currentData = ventasFiltradas.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const generarPDF = (titulo, descripcion, contenidoTabla) => {
        const input = reportRef.current;
        const margenIzquierdo = 14;
        const margenSuperior = 20;
        const margenDerecho = 14;

        const imgWidth = 210 - margenIzquierdo - margenDerecho;

        html2canvas(input, {
            margin: { top: margenSuperior, left: margenIzquierdo, right: margenDerecho },
        }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF();
            pdf.setTextColor(255, 165, 0);
            pdf.setFontSize(18);
            pdf.setFont("helvetica", "bold");
            pdf.text(String(titulo), margenIzquierdo, margenSuperior);
            pdf.setFontSize(12);
            pdf.text(String(descripcion), margenIzquierdo, margenSuperior + 10);
            pdf.setLineWidth(0.5);
            pdf.line(margenIzquierdo, margenSuperior + 12, 196 - margenDerecho, margenSuperior + 12);
            pdf.setFontSize(10);
            const fechaGeneracion = new Date().toLocaleDateString();
            pdf.text("Fecha de generación: " + fechaGeneracion, margenIzquierdo, margenSuperior + 25);
            pdf.text("Página: " + pdf.internal.getNumberOfPages(), 180, margenSuperior + 25);
            pdf.addImage(imgData, "PNG", margenIzquierdo, margenSuperior + 30, imgWidth, canvas.height * imgWidth / canvas.width);
            
            const previewBlob = pdf.output("blob");
            const url = URL.createObjectURL(previewBlob);
            const previewWindow = window.open(url, "_blank");
            previewWindow.onload = () => {
                previewWindow.print();
            };
        });
    };

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

    return (
        <AllowedAccess 
        roles={["admin"]} 
        permissions="manage-users" 
        renderAuthFailed={<NoPermission />}
        isLoading={<p>Cargando...</p>}
    >
        <div className="container">
            <h1>Informe de Ventas por Mesa</h1>
            <br />
            <div className="d-flex justify-content-between mb-4">
                <div className="search-container">
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearch}
                        className="search-input"
                        placeholder="Buscar por mesa, total o fecha (año/mes)"
                    />
                </div>
            </div>

            <div ref={reportRef}>
                <table className="table table-striped table-bordered table-hover">
                    <thead>
                        <tr>
                            <th scope="col" onClick={() => handleSort("anio")}>Año</th>
                            <th scope="col" onClick={() => handleSort("mes")}>Mes</th>
                            <th scope="col" onClick={() => handleSort("numero_mesa")}>Número de Mesa</th>
                            <th scope="col" onClick={() => handleSort("total_ventas")}>Total Ventas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.length === 0 ? (
                            <tr>
                                <td colSpan="4">No se encontraron resultados</td>
                            </tr>
                        ) : (
                            currentData.map((venta, index) => (
                                <tr key={index}>
                                    <td>{venta.anio}</td>
                                    <td>{venta.mes}</td>
                                    <td>{venta.numero_mesa}</td>
                                    <td>{parseFloat(venta.total_ventas).toFixed(2)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="d-flex justify-content-end">
                <button className="btn btn-primary" onClick={() => generarPDF("Informe de Ventas por Mesa", "Este reporte muestra el total de ventas por cada mesa en el sistema.", currentData)}>
                    Generar PDF
                </button>
            </div>
            <nav>
                <ul className="pagination">
                    {pageNumbers.map((number) => (
                        <li key={number} className="page-item">
                            <a href="#!" className="page-link" onClick={() => paginate(number)}>
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

export default ReporteVentasPorMesa;
