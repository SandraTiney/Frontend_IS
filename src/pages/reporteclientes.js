import "../style/empleado.css";
import React, { useState, useEffect, useRef } from "react";
import Axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { AllowedAccess } from 'react-permission-role';
import NoPermission from "../pages/NoPermission.js";

function ReporteCliente() {
    const [clientes, setClientes] = useState([]);
    const reportRef = useRef(); // Referencia para capturar el contenido del reporte
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Estado para ordenación
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const response = await Axios.get("http://localhost:3001/cliente/listar");
                setClientes(response.data);
            } catch (error) {
                console.error("Error fetching clients:", error);
            }
        };
        fetchClientes();
    }, []);

    // Lógica de paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // Cambio de página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Cálculo de paginación
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(clientes.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    // Función para manejar la ordenación
    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedItems = [...clientes].sort((a, b) => {
        let aField = a[sortConfig.key];
        let bField = b[sortConfig.key];

        if (aField < bField) {
            return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aField > bField) {
            return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
    });

    const currentSortedItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);

    // ** Llamada a generarPDF con título y descripción como cadenas de texto **
    const titulo = "Informe de Clientes"; 
    const descripcion = "Este reporte muestra el total de Clientes."; 
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

    return (
        <AllowedAccess 
            roles={["admin"]} 
            permissions="manage-users" 
            renderAuthFailed={<NoPermission/>}
            isLoading={<p>Cargando...</p>}
        >
            <div className="container">
                <h1>Informe de Clientes</h1>
                <br />
                <div ref={reportRef}>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col" onClick={() => handleSort("id")}>ID</th>
                                <th scope="col" onClick={() => handleSort("nit_cliente")}>NIT Cliente</th>
                                <th scope="col" onClick={() => handleSort("nombre")}>Nombre</th>
                                <th scope="col" onClick={() => handleSort("apellido")}>Apellido</th>
                                <th scope="col" onClick={() => handleSort("direccion")}>Dirección</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentSortedItems.map((cliente) => (
                                <tr key={cliente.id}>
                                    <th>{cliente.id}</th>
                                    <td>{cliente.nit_cliente}</td>
                                    <td>{cliente.nombre}</td>
                                    <td>{cliente.apellido}</td>
                                    <td>{cliente.direccion}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="d-flex justify-content-end"> {/* Botón alineado a la derecha */}
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

export default ReporteCliente;