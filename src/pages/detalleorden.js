import "../style/empleado.css";
import React, { useState, useEffect } from 'react';
import Axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import { AllowedAccess } from 'react-permission-role';
import NoPermission from "./NoPermission";

function DetalleOrden() {
    const [ordenId, setOrdenId] = useState("");
    const [platilloId, setPlatilloId] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [detalleOrdenLista, setDetalleOrdenLista] = useState([]);
    const [editarDetalle, setEditarDetalle] = useState(false);
    const [ordenes, setOrdenes] = useState([]);
    const [platillos, setPlatillos] = useState([]);

    useEffect(() => {
        obtenerDetallesOrden();
        obtenerOrdenes();
        obtenerPlatillos();
    }, []);

    const obtenerDetallesOrden = async () => {
        try {
            const response = await fetch('http://localhost:3001/detalle_orden/listar');
            const data = await response.json();
            setDetalleOrdenLista(data);
        } catch (error) {
            console.error('Error al obtener los detalles de la orden:', error);
        }
    };

    const obtenerOrdenes = async () => {
        try {
            const response = await fetch('http://localhost:3001/orden/listar');
            const data = await response.json();
            setOrdenes(data);
        } catch (error) {
            console.error('Error al obtener las órdenes:', error);
        }
    };

    const obtenerPlatillos = async () => {
        try {
            const response = await fetch('http://localhost:3001/platillos/listar');
            const data = await response.json();
            setPlatillos(data);
        } catch (error) {
            console.error('Error al obtener los platillos:', error);
        }
    };

    const agregarDetalleOrden = async () => {
        try {
            await Axios.post("http://localhost:3001/detalle_orden/guardar", {
                orden_id: ordenId,
                platillo_id: platilloId,
                cantidad: cantidad,
            });
            await obtenerDetallesOrden();
            limpiarCampos();
            Swal.fire({
                title: "<strong>Registro exitoso!!!</strong>",
                html: `<i><strong>Detalle de orden</strong> fue registrado con éxito</i>`,
                icon: "success",
                timer: 3000,
            });
        } catch (error) {
            console.error("Error al registrar el detalle de orden:", error);
            Swal.fire({
                title: "<strong>Error al registrar</strong>",
                html: `<i>${(error.response?.data?.message || "Ocurrió un error inesperado.")}</i>`,
                icon: "error",
                timer: 3000,
            });
        }
    };

    const actualizarDetalleOrden = async () => {
        try {
            await Axios.put("http://localhost:3001/detalle_orden/actualizar", {
                orden_id: ordenId,
                platillo_id: platilloId,
                cantidad: cantidad,
            });
            await obtenerDetallesOrden();
            limpiarCampos();
            Swal.fire({
                title: "<strong>Actualización exitosa!!!</strong>",
                html: `<i><strong>Detalle de orden</strong> fue actualizado con éxito</i>`,
                icon: "success",
                timer: 2500,
            });
        } catch (error) {
            console.error("Error al actualizar el detalle de orden:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudo actualizar el detalle de orden.",
                icon: "error",
            });
        }
    };

    const eliminarDetalleOrden = async (id) => {
        try {
            await Axios.delete(`http://localhost:3001/detalle_orden/eliminar/${id}`);
            await obtenerDetallesOrden();
            Swal.fire({
                title: "Eliminación exitosa",
                text: "El detalle de orden fue eliminado.",
                icon: "success",
            });
        } catch (error) {
            console.error("Error al eliminar el detalle de orden:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudo eliminar el detalle de orden.",
                icon: "error",
            });
        }
    };

    const limpiarCampos = () => {
        setOrdenId("");
        setPlatilloId("");
        setCantidad("");
        setEditarDetalle(false);
    };

    const editarDetalleOrden = (val) => {
        setEditarDetalle(true);
        setOrdenId(val.orden_id);
        setPlatilloId(val.platillo_id);
        setCantidad(val.cantidad);
    };

    return (
        <AllowedAccess 
            roles={["mesero"]} 
            permissions="manage-users"
            renderAuthFailed={<NoPermission/>}
            isLoading={<p>Cargando...</p>}
        >
            <div className="container">
                <div className="card text-center">
                    <div className="card-header">FORMULARIO DETALLE DE ORDEN</div>
                    <div className="card-body">
                        <div className="input-group mb-3">
                            <span className="input-group-text" id="basic-addon1">
                                ID Orden:{" "}
                            </span>
                            <select
                                //className="form-control"
                                value={ordenId}
                                onChange={(event) => setOrdenId(event.target.value)}
                            >
                                <option value="">Seleccione una orden</option>
                                {ordenes.map((orden) => (
                                    <option key={orden.id} value={orden.id}>{orden.id}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group mb-3">
                            <span className="input-group-text" id="basic-addon1">
                                ID Platillo:{" "}
                            </span>
                            <select
                                //className="form-control"
                                value={platilloId}
                                onChange={(event) => setPlatilloId(event.target.value)}
                            >
                                <option value="">Seleccione un platillo</option>
                                {platillos.map((platillo) => (
                                    <option key={platillo.id} value={platillo.id}>{platillo.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group mb-3">
                            <span className="input-group-text" id="basic-addon1">
                                Cantidad:{" "}
                            </span>
                            <input
                                type="number"
                                onChange={(event) => setCantidad(event.target.value)}
                                //className="form-control"
                                value={cantidad}
                            />
                        </div>
                    </div>
                    <div className="card-footer text-muted">
                        {editarDetalle ? (
                            <div>
                                <button className="btn btn-warning m-2" onClick={actualizarDetalleOrden}>
                                    Actualizar Detalle
                                </button>
                                <button className="btn btn-danger m-2" onClick={limpiarCampos}>
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <button className="btn btn-primary m-2" onClick={agregarDetalleOrden}>
                                Agregar Detalle
                            </button>
                        )}
                    </div>
                </div>

                <table className="table table-striped mt-4">
                    <thead>
                        <tr>
                            <th>ID Orden</th>
                            <th>ID Platillo</th>
                            <th>Cantidad</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detalleOrdenLista.map((detalle, index) => (
                            <tr key={index}>
                                <td>{detalle.orden_id}</td>
                                <td>{detalle.platillo_id}</td>
                                <td>{detalle.cantidad}</td>
                                <td>
                                    <button className="btn btn-info" onClick={() => editarDetalleOrden(detalle)}>Editar</button>
                                    <button className="btn btn-danger" onClick={() => eliminarDetalleOrden(detalle.id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AllowedAccess>
    );
}
export default DetalleOrden;
