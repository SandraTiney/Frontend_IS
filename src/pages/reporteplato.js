import "../style/empleado.css";
import React, { useState, useEffect, useRef } from "react";
import Axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { AllowedAccess } from 'react-permission-role';
import NoPermission from "./NoPermission";

function ReportePlatos() {
    const [platos, setPlatos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [error, setError] = useState(""); // Estado para errores
    const reportRef = useRef(); 

    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 14;

    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const platosResponse = await Axios.get("http://localhost:3001/platillos/listar");
                setPlatos(platosResponse.data);
                const categoriasResponse = await Axios.get("http://localhost:3001/categoria/listar");
                setCategorias(categoriasResponse.data);
            } catch (error) {
                setError("Error al cargar los datos");
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(platos.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedItems = [...platos].sort((a, b) => {
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

    const getCategoriaNombre = (categoriaId) => {
        const categoria = categorias.find((cat) => cat.id === categoriaId);
        return categoria ? categoria.nombre : "No disponible";
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

    return (
        <AllowedAccess 
            roles={["admin"]} 
            permissions="manage-users" /*view-report*/
            renderAuthFailed={<NoPermission/>}
            isLoading={<p>Cargando...</p>}
        >
            <div className="container">
                <h1>Informe de Platos</h1>
                <br />
                {error && <div className="alert alert-danger">{error}</div>} {/* Mostrar errores */}
                <div ref={reportRef}>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col" onClick={() => handleSort("id")}>Id</th>
                                <th scope="col" onClick={() => handleSort("nombre")}>Nombre</th>
                                <th scope="col" onClick={() => handleSort("categoria_id")}>Categoría</th>
                                <th scope="col" onClick={() => handleSort("precio")}>Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentSortedItems.map((plato) => (
                                <tr key={plato.id}>
                                    <th>{plato.id}</th>
                                    <td>{plato.nombre}</td>
                                    <td>{getCategoriaNombre(plato.categoria_id)}</td>
                                    <td>{plato.precio}</td>
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
                            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                <a
                                    href="#!"
                                    className="page-link"
                                    onClick={() => paginate(number)}
                                    style={{ cursor: currentPage === number ? 'default' : 'pointer' }} 
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

export default ReportePlatos;