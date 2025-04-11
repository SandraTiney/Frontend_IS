import "../style/empleado.css";
import React, { useState, useEffect } from 'react';
import Axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import { AllowedAccess } from 'react-permission-role';
import NoPermission from "./NoPermission";

function Platillos() {
    // Hooks de Platillos
    const [id, setId] = useState(""); /*este id es id_platillos */
    const [nombre, setNombre] = useState("");
    const [categoria_id, setCategoriaId] = useState("");
    const [precio, setPrecio] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [listaPlatillos, setListaPlatillosState] = useState([]); // Cambié el nombre del estado a setListaPlatillosState para evitar conflictos con la función listaPlatillos
    const [categorias, setCategorias] = useState([]);
    const [editarPlatillo, setEditarPlatilloState] = useState(false); // Cambié a setEditarPlatilloState
    const [imagen, setImagen] = useState("");

    // Obtener lista de categorías
    useEffect(() => {
        const obtenerCategorias = async () => {
            try {
                const response = await fetch('http://localhost:3001/categoria/listar');
                const data = await response.json();
                setCategorias(data);
            } catch (error) {
                console.error('Error al obtener categorías:', error);
            }
        };
        obtenerCategorias();
    }, []);

    // Obtener lista de platillos
    const listarPlatillos = async () => {
        try {
            const response = await Axios.get("http://localhost:3001/platillos/listar");
            setListaPlatillosState(response.data); // Cambié el nombre para evitar conflictos
        } catch (error) {
            console.error('Error al listar platillos:', error);
        }
    };
    useEffect(() => {
        listarPlatillos();
    }, []);

    const guardarPlatillo = async () => {
        try {
        await Axios.post("http://localhost:3001/platillos/guardar", {nombre, descripcion, categoria_id, precio, imagen});
            listarPlatillos();
            limpiarCampos();
            Swal.fire({
                title: "<strong>Registro exitoso!!!</strong>",
                html: `<i><strong>${nombre}</strong> fue registrado con éxito</i>`,
                icon: "success",
                timer: 3000,
            });
        } catch (error) {
            console.error("Error al registrar el platillo:", error.response ? error.response.data : error.message);
            Swal.fire({
                title: "<strong>Error al registrar</strong>",
                html: "<i>" + (error.response?.data?.message || "Ocurrió un error inesperado.") + "</i>",
                icon: "error",
                timer: 3000,
            });
        }
    };

    const actualizarPlatillo = async () => {
        try {
            await Axios.put("http://localhost:3001/platillos/actualizar", { id, nombre, descripcion, categoria_id,  precio, imagen});
            listarPlatillos();
            limpiarCampos();
            Swal.fire({
                title: "<strong>Actualización exitosa!!!</strong>",
                html: `<i><strong>${nombre}</strong> fue actualizado con éxito</i>`,
                icon: "success",
                timer: 2500,
            });
        } catch (error) {
            console.error("Error al actualizar el platillo:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudo actualizar el platillo.",
                icon: "error",
            });
        }
    };

    const limpiarCampos = () => {
        setNombre("");
        setCategoriaId("");
        setPrecio("");
        setId("");
        setImagen(""); // Limpiar imagen
        setEditarPlatilloState(false); // Cambié a setEditarPlatilloState
    };

    const editarPlatilloHandler = (platillo) => {
        setEditarPlatilloState(true); // Cambié a setEditarPlatilloState
        setId(platillo.id);
        setNombre(platillo.nombre);
        setCategoriaId(platillo.categoria_id);
        setPrecio(platillo.precio);
        setImagen(platillo.imagen); // Establecer la imagen actual del platillo para edición
    };


    return (
        <AllowedAccess 
            roles={["admin"]} 
            permissions="manage-users" /*manage-menu*/
            renderAuthFailed={<NoPermission />}
            isLoading={<p>Cargando...</p>}
        >
            <div className="container">
                <div className="card text-center">
                    <div className="card-header">FORMULARIO CREAR PLATILLO</div>
                    <div className="card-body">
                        <div className="input-group mb-3">
                            <label className="plat">Nombre del Platillo:</label>
                            <input
                                type="text"
                                onChange={(event) => setNombre(event.target.value)}
                                value={nombre}
                                placeholder="Ingrese el nombre del platillo"
                            />
                        </div>
                        <div className="input-group mb-3">
                        <label className="plat">Categoria:</label>
                            <select value={categoria_id} onChange={(e) => setCategoriaId(e.target.value)}>
                                <option value="">Seleccione una categoría</option>
                                {categorias.map((categoria) => (
                                    <option key={categoria.id} value={categoria.id}>
                                        {categoria.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group mb-3">
                        <label className="plat">Precio:</label>
                            <input
                                type="number"
                                onChange={(event) => setPrecio(event.target.value)}
                                value={precio}
                                className="Ingrese el Precio"
                            />
                        </div>
                        <div className="input-group mb-3">
                            <label className="plat">Imagen:</label>
                            <input
                                type="text"
                                onChange={(event) => setImagen(event.target.value)}
                                value={imagen}
                            />
                        </div>
                    </div>
                    <div className="card-footer text-muted">
                        {editarPlatillo ? (
                            <div>
                                <button className="btn btn-warning m-2" onClick={actualizarPlatillo}>
                                    Actualizar Platillo
                                </button>
                                <button className="btn btn-info m-2" onClick={limpiarCampos}>
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <button className="btn btn-success" onClick={guardarPlatillo}>
                                Registrar Platillo
                            </button>
                        )}
                    </div>
                </div>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Nombre</th>
                            <th scope="col">Categoría</th>
                            <th scope="col">Precio</th>
                            <th scope="col">Imagen</th>
                            <th scope="col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listaPlatillos.map((val) => {
                            const categoria = categorias.find(c => c.id === val.categoria_id);
                            return (
                                <tr key={val.id}>
                                    <th>{val.id}</th>
                                    <td>{val.nombre}</td>
                                    <td>{categoria ? categoria.nombre : "No disponible"}</td>
                                    <td>{val.precio}</td>
                                    <td> 
                                        <img 
                                            src={val.imagen} 
                                            alt={val.nombre} 
                                            style={{ width: '100px', height: 'auto' }} 
                                        />
                                    </td>
                                    <td>
                                        <div className="btn-group" role="group">
                                            <button type="button" onClick={() => editarPlatilloHandler(val)} className="btn btn-info">
                                                Editar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </AllowedAccess>
    );
}

export default Platillos;
