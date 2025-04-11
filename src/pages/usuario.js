import "../style/usuarios.css";
import React, { useState, useEffect } from 'react';
import Axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import { AllowedAccess } from 'react-permission-role';
import NoPermission from "../pages/NoPermission.js";

function Usuario() {
  const [id, setId] = useState("");
  const [personas, setPersonas] = useState([]);
  const [personasSinUsuario, setPersonasSinUsuario] = useState([]);
  const [idPersona, setIdPersona] = useState("");
  const [idRol, setIdRol] = useState("");
  const [idEstado, setIdEstado] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usuariolista, setusuariolista] = useState([]);
  const [editarUser, seteditarUser] = useState(false);
  const [roles, setRoles] = useState([]);
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    const obtenerListaPersonas = async () => {
      try {
        const response = await fetch('http://localhost:3001/obtenerlistapersonas');
        const data = await response.json();
        setPersonas(data);
      } catch (error) {
        console.error('Error al obtener las personas:', error);
      }
    };
    obtenerListaPersonas();
  }, []);

  const obtenerPersonasSinUsuario = async () => {
    try {
      const response = await fetch('http://localhost:3001/obtenerpersona');
      const data = await response.json();
      setPersonasSinUsuario(data);
    } catch (error) {
      console.error('Error al obtener las personas:', error);
    }
  };

  useEffect(() => {
    obtenerPersonasSinUsuario();
  }, []);

  useEffect(() => {
    const obtenerestado = async () => {
      try {
        const response = await fetch('http://localhost:3001/obtenerestado');
        const data = await response.json();
        setEstados(data);
      } catch (error) {
        console.error('Error al obtener las Estados:', error);
      }
    };
    obtenerestado();
  }, []);

  useEffect(() => {
    const obtenerrol = async () => {
      try {
        const response = await fetch('http://localhost:3001/obtenerrol');
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        console.error('Error al obtener roles:', error);
      }
    };
    obtenerrol();
  }, []);

  const addUser = () => {
    Axios.post("http://localhost:3001/create-usuario", {
      id_persona: idPersona,
      rol_id: idRol,
      estado_id: idEstado,
      username: username,
      password: password
    }).then(() => {
      listaUsuarios();
      obtenerPersonasSinUsuario();
      limpiarcampos();
      Swal.fire({
        title: "<strong>Registro exitoso!!!</strong>",
        html: `<i><strong>${username}</strong> fue registrado con éxito</i>`,
        icon: "success",
        timer: 3000,
      });
    }).catch((error) => {
      console.error("Error al registrar el usuario:", error);
      Swal.fire({
        title: "<strong>Error al registrar</strong>",
        html: `<i>${error.response?.data?.message || "Ocurrió un error inesperado."}</i>`,
        icon: "error",
        timer: 3000,
      });
    });
  };

  const updateUser = () => {
  Axios.put(`http://localhost:3001/actualizar/${id}`, {
      id_persona: idPersona,
      rol_id: idRol,
      estado_id: idEstado,
      username: username,
      password: password,
    }).then(() => {
      listaUsuarios();
      limpiarcampos();
      Swal.fire({
        title: "<strong>Actualización exitosa!!!</strong>",
        html: `<i><strong>${username}</strong> fue actualizado con éxito</i>`,
        icon: "success",
        timer: 2500,
      });
    }).catch(error => {
      console.error("Error updating user:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el usuario.",
        icon: "error",
      });
    });
  };

  const limpiarcampos = () => {
    setIdPersona("");
    setIdRol("");
    setIdEstado("");
    setUsername("");
    setPassword("");
    setId("");
    seteditarUser(false);
  };

  const editarUsuario = (val) => {
    seteditarUser(true);
    setIdPersona(val.id_persona);
    setIdRol(val.rol_id);
    setIdEstado(val.estado_id);
    setUsername(val.username);
    setPassword(val.password);
    setId(val.id_usuario)
  };

  const listaUsuarios = () => {
    Axios.get("http://localhost:3001/obteneruser").then((response) => {
      setusuariolista(response.data);
    });
  };

  listaUsuarios();

  return (
    <AllowedAccess 
      roles={["admin"]} 
      permissions="manage-users" 
      renderAuthFailed={<NoPermission />}
      isLoading={<p>Cargando...</p>}
    >
      <div className="usuario-container">
        <div className="form-card">
          <div className="form-header">Formulario Crear Usuario</div>
          <div className="form-body">
            {/* Campos del formulario */}
            <div className="input-group mb-3">
              <label>Empleado:</label>
              <select value={idPersona} onChange={(e) => setIdPersona(e.target.value)}>
                <option value="">Seleccione un empleado</option>
                {personasSinUsuario.map((persona) => (
                  <option key={persona.id} value={persona.id}>{persona.primer_nombre}</option>
                ))}
              </select>
            </div>
            <div className="input-group mb-3">
              <label>Rol:</label>
              <select value={idRol} onChange={(e) => setIdRol(e.target.value)}>
                <option value="">Seleccione un rol</option>
                {roles.map((rol) => (
                  <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre}</option>
                ))}
              </select>
            </div>
            <div className="input-group mb-3">
              <label>Estado:</label>
              <select value={idEstado} onChange={(e) => setIdEstado(e.target.value)}>
                <option value="">Seleccione un estado</option>
                {estados.map((estado) => (
                  <option key={estado.id_estado} value={estado.id_estado}>{estado.descripcion}</option>
                ))}
              </select>
            </div>
            <div className="input-group mb-3">
              <label>Usuario:</label>
              <input type="text" onChange={(event) => setUsername(event.target.value)} value={username} />
            </div>
            <div className="input-group mb-3">
              <label>Contraseña:</label>
              <input type="password" onChange={(event) => setPassword(event.target.value)} value={password} />
            </div>
          </div>
          <div className="form-footer">
            {editarUser ? (
              <>
                <button className="btn btn-warning" onClick={updateUser}>Actualizar Usuario</button>
                <button className="btn btn-secondary" onClick={limpiarcampos}>Cancelar</button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={addUser}>Registrar Usuario</button>
            )}
          </div>
        </div>
{/* Tabla de usuarios */}
<div className="table-responsive">
  <table className="usuario-table table table-bordered">
    <thead>
      <tr>
        <th>#</th>
        <th>Empleado</th>
        <th>Rol</th>
        <th>Estado</th>
        <th>Usuario</th>
        <th>Fecha de creación</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {usuariolista.map((val) => {
        const empleado = personas.find(p => p.id === val.id_persona);
        const rol = roles.find(r => r.id_rol === val.rol_id);
        const estado = estados.find(e => e.id_estado === val.estado_id);

        return (
          <tr key={val.id_usuario}>
            <td>{val.id_usuario}</td>
            <td>{empleado ? empleado.primer_nombre : "No disponible"}</td>
            <td>{rol ? rol.nombre : "No disponible"}</td>
            <td>{estado ? estado.descripcion : "No disponible"}</td>
            <td>{val.username}</td>
            <td>{val.fecha_creacion}</td>
            <td>
              <button className="btn btn-info" onClick={() => editarUsuario(val)}>Editar</button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>

      </div>
    </AllowedAccess>
  );
}

export default Usuario;
