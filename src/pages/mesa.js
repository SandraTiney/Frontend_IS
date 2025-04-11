import "../style/empleado.css";
import React, { useState, useEffect } from 'react';
//instalar axios npm install axios
import Axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import { AllowedAccess } from 'react-permission-role';
import NoPermission from "./NoPermission";

function Mesa() {
    // Hooks para manejar los datos de las mesas
    const [numero, setNumero] = useState("");
    const [capacidadMax, setCapacidadMax] = useState("");
    const [mesaLista, setMesaLista] = useState([]);
    const [editarMesa, setEditarMesa] = useState(false);
    const [id, setId] = useState("");

    // Función para listar mesas
    const listarMesas = async () => {
        try {
            const response = await Axios.get("http://localhost:3001/mesas/listar");
            setMesaLista(response.data);
        } catch (error) {
            console.error("Error al listar mesas:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudo listar las mesas.",
                icon: "error",
            });
        }
    };

    useEffect(() => {
        listarMesas();
    }, []);

    // Función para guardar mesa
    const guardarMesa = async () => {
        try {
            await Axios.post("http://localhost:3001/mesas/guardar", {
                numero: numero,
                capacidad_max: capacidadMax
            });
            listarMesas();
            limpiarCampos();
            Swal.fire({
                title: "Registro exitoso",
                text: "La mesa fue registrada con éxito",
                icon: "success",
                timer: 3000,
            });
        } catch (error) {
            console.error("Error al guardar la mesa:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudo guardar la mesa.",
                icon: "error",
            });
        }
    };

    // Función para actualizar mesa
    const actualizarMesa = async () => {
        try {
            await Axios.put("http://localhost:3001/mesas/actualizar", {
                id: id,
                numero: numero,
                capacidad_max: capacidadMax
            });
            listarMesas();
            limpiarCampos();
            Swal.fire({
                title: "Actualización exitosa",
                text: "La mesa fue actualizada con éxito",
                icon: "success",
                timer: 2500,
            });
        } catch (error) {
            console.error("Error al actualizar la mesa:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudo actualizar la mesa.",
                icon: "error",
            });
        }
    };

    // Función para limpiar campos
    const limpiarCampos = () => {
        setNumero("");
        setCapacidadMax("");
        setId("");
        setEditarMesa(false);
    };

    // Función para editar mesa
    const editarMesaHandler = (mesa) => {
        setEditarMesa(true);
        setNumero(mesa.numero);
        setCapacidadMax(mesa.capacidad_max);
        setId(mesa.id);
    };

    return (
        <AllowedAccess 
            roles={["admin"]} 
            permissions="manage-users" /*manage-menu*/
            renderAuthFailed={<NoPermission/>}
            isLoading={<p>Cargando...</p>}
        >
            <div className="container">
                <div className="card text-center">
                    <div className="card-header">FORMULARIO CREAR MESA</div>
                    <div className="card-body">
                        <div className="input-group mb-3">
                        <label className="plat">Numero de Mesa:</label>
                            <input
                                type="number"
                                onChange={(event) => setNumero(event.target.value)}
                                //className="form-control"
                                value={numero}
                                placeholder="Ingrese el numero de mesa"
                            />
                        </div>
                        <div className="input-group mb-3">
                            <label className="plat">Capacidad Maxima:</label>
                            <input
                                type="number"
                                onChange={(event) => setCapacidadMax(event.target.value)}
                                //className="form-control"
                                value={capacidadMax}
                                placeholder="Ingrese la capacidad maxima de la mesa"
                            />
                        </div>
                    </div>
                    <div className="card-footer text-muted">
                        {editarMesa ? (
                            <div>
                                <button className="btn btn-warning m-2" onClick={actualizarMesa}>
                                    Actualizar Mesa
                                </button>
                                <button className="btn btn-info m-2" onClick={limpiarCampos}>
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <button className="btn btn-success" onClick={guardarMesa}>
                                Registrar Mesa
                            </button>
                        )}
                    </div>
                </div>

                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Número de Mesa</th>
                            <th scope="col">Capacidad Máxima</th>
                            <th scope="col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mesaLista.map((mesa) => (
                            <tr key={mesa.id}>
                                <th>{mesa.id}</th>
                                <td>{mesa.numero}</td>
                                <td>{mesa.capacidad_max}</td>
                                <td>
                                    <div className="btn-group" role="group" aria-label="Basic example">
                                        <button type="button" onClick={() => editarMesaHandler(mesa)} className="btn btn-info">
                                            Editar
                                        </button>
                                        {/* Aquí podrías agregar la función para eliminar una mesa si es necesario */}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AllowedAccess>
    );
}

export default Mesa;
