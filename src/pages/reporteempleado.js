import "../style/empleado.css";
import React, { useState, useEffect, useRef } from "react";
import Axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { AllowedAccess } from 'react-permission-role';
/*import NoPermission from "./NoPermission";*/
import NoPermission from "../pages/NoPermission.js";

function ReporteEmpleado() {
    const [empleados, setEmpleados] = useState([]);
    const reportRef = useRef(); // Referencia para capturar el contenido del reporte
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Estado para ordenación
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    useEffect(() => {
        const fetchEmpleados = async () => {
            try {
                const response = await Axios.get("http://localhost:3001/obtenerlistapersonas");
                setEmpleados(response.data);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };
        fetchEmpleados();
    }, []);

    // Lógica de paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // Cambio de página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Cálculo de paginación
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(empleados.length / itemsPerPage); i++) {
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

    const sortedItems = [...empleados].sort((a, b) => {
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
    const titulo = "Informe de Empleados"; 
    const descripcion = "Este reporte muestra el total de Empleados."; 
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
            permissions="manage-users" /*view-report*/
            renderAuthFailed={<NoPermission/>}
            isLoading={<p>Cargando...</p>}
        >
            <div className="container">
                <h1>Informe de Empleados</h1>
                <br />
                <div ref={reportRef}>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col" onClick={() => handleSort("id")}>Id</th>
                                <th scope="col" onClick={() => handleSort("primer_nombre")}>Primer Nombre</th>
                                <th scope="col" onClick={() => handleSort("segundo_nombre")}>Segundo Nombre</th>
                                <th scope="col" onClick={() => handleSort("primer_apellido")}>Primer Apellido</th>
                                <th scope="col" onClick={() => handleSort("segundo_apellido")}>Segundo Apellido</th>
                                <th scope="col" onClick={() => handleSort("telefono")}>Teléfono</th>
                                <th scope="col" onClick={() => handleSort("email")}>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentSortedItems.map((empleado) => (
                                <tr key={empleado.id}>
                                    <th>{empleado.id}</th>
                                    <td>{empleado.primer_nombre}</td>
                                    <td>{empleado.segundo_nombre}</td>
                                    <td>{empleado.primer_apellido}</td>
                                    <td>{empleado.segundo_apellido}</td>
                                    <td>{empleado.telefono}</td>
                                    <td>{empleado.email}</td>
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

export default ReporteEmpleado;
