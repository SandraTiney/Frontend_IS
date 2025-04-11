import "../style/cateplato.css"; 
import { useState, useEffect } from "react";
import Axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import { AllowedAccess } from 'react-permission-role';
import NoPermission from "./NoPermission";

function Categoriaplato() {
    const [id, setId] = useState("");
    const [nombre, setNombre] = useState("");
    const [categoriasList, setCategoriasList] = useState([]);
    const [editar, setEditar] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    const [searchTerm, setSearchTerm] = useState("");

    const guardar = async () => {
        try {
            await Axios.post("http://localhost:3001/categoria/guardar", { nombre });
            listarCategorias();
            limpiarCampos();
            Swal.fire({
                title: "<strong>Registro exitoso!!!</strong>",
                html: `<i><strong>${nombre}</strong> fue registrado con éxito</i>`,
                icon: "success",
                timer: 3000,
            });
        } catch (error) {
            console.error('Error al guardar la categoría:', error);
            let errorMessage = "No se pudo registrar la categoría.";
            if (error.response) {
                // Analizar el error recibido del servidor
                if (error.response.status === 409) {
                    errorMessage = "El nombre de la categoría ya existe. Por favor, elige otro nombre.";
                } else if (error.response.status === 500) {
                    errorMessage = "Error del servidor. Inténtalo de nuevo más tarde.";
                }
            }   
    
            // Mostrar notificación de error personalizada
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: errorMessage,
            });
        }
    };

    const actualizar = async () => {
        try {
            await Axios.put("http://localhost:3001/categoria/actualizar", { id, nombre });
            listarCategorias();
            limpiarCampos();
            Swal.fire({
                title: "<strong>Actualización exitosa!!!</strong>",
                html: `<i><strong>${nombre}</strong> fue actualizado con éxito</i>`,
                icon: "success",
                timer: 2500,
            });
        } catch (error) {
            console.error('Error al actualizar la categoría:', error);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "No se pudo actualizar la categoría.",
            });
        }
    };

    const eliminarCategoria = async (val) => {
        const result = await Swal.fire({
            title: "Confirmar Eliminado",
            html: `<i>¿Está seguro que desea eliminar <strong>${val.nombre}</strong> ?</i>`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#4CAF50",
            cancelButtonColor: "#F44336",
            confirmButtonText: "Sí, eliminarlo!",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                await Axios.delete(`http://localhost:3001/categoria/eliminar/${val.id}`);
                listarCategorias();
                limpiarCampos();
                Swal.fire({
                    title: "Eliminado!",
                    html: `<strong>${val.nombre}</strong> fue eliminado`,
                    icon: "success",
                    timer: 2000,
                });
            } catch (error) {
                const errorMessage = error.response?.data?.message || `No se logró eliminar <strong>${val.nombre}</strong>`;
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    html: errorMessage,
                    footer: error.message === "Network Error" ? "Intente más tarde" : error.message,
                });
            }
        }
    };

    const limpiarCampos = () => {
        setNombre("");
        setId("");
        setEditar(false);
    };

    const editarCategoria = (val) => {
        setEditar(true);
        setNombre(val.nombre);
        setId(val.id);
    };

    const listarCategorias = async () => {
        try {
            const response = await Axios.get("http://localhost:3001/categoria/listar");
            setCategoriasList(response.data);
        } catch (error) {
            console.error('Error al listar categorías:', error);
        }
    };

    useEffect(() => {
        listarCategorias();
    }, []);

    const filteredCategoriasList = categoriasList.filter((categoria) =>
        categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCategoriasList.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCategoriasList.length / itemsPerPage);
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <AllowedAccess
            roles={["admin"]}
            permissions="manage-users"
            renderAuthFailed={<NoPermission/>}
            isLoading={<p>Cargando...</p>}
        >
        <div className="container">
            <div className="container-empleado">
                <div className="card text-center">
                    <div className="card-header">FORMULARIO DE CATEGORÍAS</div>
                    <div className="card-body">
                        <div className="input-group mb-3">
                            <label className="Cat">Categoria:</label>
                            <input
                            type="text"
                            onChange={(event) => setNombre(event.target.value)}
                            //className="form-control" /* Se aplican las nuevas propiedades de estilo */
                            value={nombre}
                            placeholder="Ingrese el nombre de la categoría"
                            aria-label="Nombre"
                            aria-describedby="basic-addon1"
                            />

                        </div>
                    </div>
                    <div className="card-footer text-muted">
                        {editar ? (
                            <div>
                                <button className="btn btn-warning m-2" onClick={actualizar}>
                                    Actualizar categoría
                                </button>
                                <button className="btn btn-info m-2" onClick={limpiarCampos}>
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <button className="btn btn-success" onClick={guardar}>
                                Registrar categoría
                            </button>
                        )}
                    </div>
                </div>
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control mb-3"
                />
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">Id</th>
                            <th scope="col">Nombre</th>
                            <th scope="col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((val) => (
                            <tr key={val.id}>
                                <th>{val.id}</th>
                                <td>{val.nombre}</td>
                                <td>
                                    <div className="btn-group" role="group" aria-label="Basic example">
                                        <button
                                            type="button"
                                            onClick={() => editarCategoria(val)}
                                            className="btn btn-info"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => eliminarCategoria(val)}
                                            className="btn btn-danger"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <nav>
                    <ul className="pagination">
                        {pageNumbers.map((number) => (
                            <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                                <button className="page-link" onClick={() => paginate(number)}>{number}</button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            </div>
        </AllowedAccess>
    );
}

export default Categoriaplato;