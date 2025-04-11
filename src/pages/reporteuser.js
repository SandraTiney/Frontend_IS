import "../style/empleado.css";
import React, { useState, useEffect, useRef } from "react";
import Axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { AllowedAccess } from 'react-permission-role';
import NoPermission from "./NoPermission";


function ReporteUser() {
    const [personas, setPersonas] = useState([]);
    const [usuariolista, setusuariolista] = useState([]);
    const [roles, setRoles] = useState([]);
    const [estados, setEstados] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const reportRef = useRef();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const personasResponse = await Axios.get("http://localhost:3001/obtenerlistapersonas");
                setPersonas(personasResponse.data);
                const rolesResponse = await Axios.get("http://localhost:3001/obtenerrol");
                setRoles(rolesResponse.data);
                const estadosResponse = await Axios.get("http://localhost:3001/obtenerestado");
                setEstados(estadosResponse.data);
                getUsuario();
            } catch (error) {
                console.error("Error fetching data:", error);
                // Aquí podrías establecer un estado para mostrar un mensaje al usuario.
            }
        };

        fetchData();
    }, []);

    const getUsuario = async () => {
        try {
            const response = await Axios.get("http://localhost:3001/obteneruser");
            setusuariolista(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(usuariolista.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedItems = [...usuariolista].sort((a, b) => {
        if (sortConfig.key) {
            const aField = getFieldValue(a);
            const bField = getFieldValue(b);
            if (aField < bField) return sortConfig.direction === "asc" ? -1 : 1;
            if (aField > bField) return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
    });

    const getFieldValue = (user) => {
        switch (sortConfig.key) {
            case "empleado":
                return personas.find((p) => p.id === user.id_persona)?.primer_nombre || "";
            case "apellido":
                return personas.find((p) => p.id === user.id_persona)?.primer_apellido || "";
            case "rol":
                return roles.find((r) => r.id_rol === user.rol_id)?.nombre || "";
            case "estado":
                return estados.find((e) => e.id_estado === user.estado_id)?.descripcion || "";
            default:
                return user[sortConfig.key];
        }
    };

    const currentSortedItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);

    // ** Llamada a generarPDF con título y descripción como cadenas de texto **
    const titulo = "Informe de Usuarios"; // Título como cadena
    const descripcion = "Este reporte muestra el total usuarios en el sistema."; // Descripción como cadena
    const contenidoTabla = "Contenido de la tabla"; // Agrega el contenido que desees para la tabla

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
            renderAuthFailed={<NoPermission/>}
            isLoading={<p>Cargando...</p>}
        >
            <div className="container">
                <h1>Informe de Usuarios Activo o Inactivo</h1>
                <br />
                <div ref={reportRef}>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col" onClick={() => handleSort("id_usuario")}>Id</th>
                                <th scope="col" onClick={() => handleSort("empleado")}>Empleado</th>
                                <th scope="col" onClick={() => handleSort("apellido")}>Apellido</th>
                                <th scope="col" onClick={() => handleSort("rol")}>Rol</th>
                                <th scope="col" onClick={() => handleSort("estado")}>Estado</th>
                                <th scope="col" onClick={() => handleSort("username")}>Usuario</th>
                                <th scope="col" onClick={() => handleSort("fecha_creacion")}>Fecha de creación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentSortedItems.map((val) => {
                                const empleado = personas.find((p) => p.id === val.id_persona);
                                const rol = roles.find((r) => r.id_rol === val.rol_id);
                                const estado = estados.find((e) => e.id_estado === val.estado_id);

                                return (
                                    <tr key={val.id_usuario}>
                                        <th>{val.id_usuario}</th>
                                        <td>{empleado ? empleado.primer_nombre : "No disponible"}</td>
                                        <td>{empleado ? empleado.primer_apellido : "No disponible"}</td>
                                        <td>{rol ? rol.nombre : "No disponible"}</td>
                                        <td>{estado ? estado.descripcion : "No disponible"}</td>
                                        <td>{val.username}</td>
                                        <td>{val.fecha_creacion}</td>
                                    </tr>
                                );
                            })}
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

export default ReporteUser;
