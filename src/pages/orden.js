import "../style/empleado.css";
import React, { useState, useEffect } from 'react';
import Axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import { AllowedAccess } from 'react-permission-role';
import NoPermission from "./NoPermission";

function Orden() {
    // Hooks de Orden
    const [mesaId, setMesaId] = useState("");
    const [fechaOrden, setFechaOrden] = useState("");
    const [total, setTotal] = useState("");

    const [idUsuario, setIdUsuario] = useState("");
    const [usuarios, setUsuarios] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [editarOrden, setEditarOrden] = useState(false);
    const [idOrden, setIdOrden] = useState("");

    // Cargar usuarios disponibles
    useEffect(() => {
        const obtenerUsuarios = async () => {
            try {
                const response = await fetch('http://localhost:3001/obteneruser');
                const data = await response.json();
                setUsuarios(data);
            } catch (error) {
                console.error('Error al obtener usuarios:', error);
            }
        };
        obtenerUsuarios();
    }, []);

    // Cargar mesas disponibles
    useEffect(() => {
        const obtenerMesas = async () => {
            try {
                const response = await fetch('http://localhost:3001/mesas/listar');
                const data = await response.json();
                setMesas(data);
            } catch (error) {
                console.error('Error al obtener mesas:', error);
            }
        };
        obtenerMesas();
    }, []);

    // Guardar nueva orden
    const addOrden = async () => {
        try {
            await Axios.post("http://localhost:3001/orden/guardar", {
                id_usuario: idUsuario,
                mesa_id: mesaId,
                fecha_orden: fechaOrden,
                total: total,
            });
            await listaOrdenes();
            limpiarCampos();
            Swal.fire({
                title: "<strong>Orden registrada!</strong>",
                html: "<i>Orden guardada exitosamente</i>",
                icon: "success",
                timer: 3000,
            });
        } catch (error) {
            console.error("Error al registrar la orden:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudo registrar la orden.",
                icon: "error",
            });
        }
    };

    // Actualizar orden
    const updateOrden = async () => {
        try {
            await Axios.put("http://localhost:3001/orden/actualizar", {
                id_orden: idOrden,
                id_usuario: idUsuario,
                mesa_id: mesaId,
                fecha_orden: fechaOrden,
                total: total,
            });
            await listaOrdenes();
            limpiarCampos();
            Swal.fire({
                title: "<strong>Orden actualizada!</strong>",
                html: "<i>Orden actualizada exitosamente</i>",
                icon: "success",
                timer: 2500,
            });
        } catch (error) {
            console.error("Error al actualizar la orden:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudo actualizar la orden.",
                icon: "error",
            });
        }
    };

    // Limpiar campos del formulario
    const limpiarCampos = () => {
        setIdUsuario("");
        setMesaId("");
        setFechaOrden("");
        setTotal("");
        setEditarOrden(false);
        setIdOrden("");
    };

    // Editar orden
    const editarOrdenes = (orden) => {
        setEditarOrden(true);
        setIdUsuario(orden.id_usuario);
        setMesaId(orden.mesa_id);
        setFechaOrden(orden.fecha_orden);
        setTotal(orden.total);
        setIdOrden(orden.id_orden);
    };

    // Listar todas las ordenes
    const listaOrdenes = async () => {
        try {
            const response = await Axios.get("http://localhost:3001/orden/listar");
            setOrdenes(response.data);
        } catch (error) {
            console.error("Error al listar ordenes:", error);
        }
    };

    useEffect(() => {
        listaOrdenes();
    }, []);

    return (
        <AllowedAccess 
            roles={["mesero"]} 
            permissions="manage-users" /*manage-order*/
            renderAuthFailed={<NoPermission/>}
            isLoading={<p>Cargando...</p>}
        >
            <div className="container">
                <div className="card text-center">
                    <div className="card-header">FORMULARIO CREAR ORDEN</div>
                    <div className="card-body">
                        <div className="input-group mb-3">
                            <span className="input-group-text">Usuario: </span>
                            <select value={idUsuario} onChange={(e) => setIdUsuario(e.target.value)}>
                                <option value="">Seleccione un usuario</option>
                                {usuarios.map((usuario) => (
                                    <option key={usuario.id} value={usuario.id}>
                                        {usuario.id_usuario}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group mb-3">
                            <span className="input-group-text">Mesa: </span>
                            <select value={mesaId} onChange={(e) => setMesaId(e.target.value)}>
                                <option value="">Seleccione una mesa</option>
                                {mesas.map((mesa) => (
                                    <option key={mesa.id} value={mesa.id}>
                                        Mesa {mesa.numero}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group mb-3">
                            <span className="input-group-text">Fecha Orden: </span>
                            <input
                                type="datetime-local"
                                //className="form-control"
                                value={fechaOrden}
                                onChange={(e) => setFechaOrden(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="card-footer text-muted">
                        {editarOrden ? (
                            <div>
                                <button className="btn btn-warning m-2" onClick={updateOrden}>
                                    Actualizar Orden
                                </button>
                                <button className="btn btn-info m-2" onClick={limpiarCampos}>
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <button className="btn btn-success" onClick={addOrden}>
                                Registrar Orden
                            </button>
                        )}
                    </div>
                </div>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Usuario</th>
                            <th>Mesa</th>
                            <th>Fecha de Orden</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenes.map((orden) => (
                            <tr key={orden.id_orden}>
                                <th>{orden.id_orden}</th>
                                <td>{orden.id_usuario}</td>
                                <td>{orden.mesa_id}</td>
                                <td>{orden.fecha_orden}</td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => editarOrdenes(orden)}
                                        className="btn btn-info"
                                    >
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AllowedAccess>
    );
}

export default Orden;