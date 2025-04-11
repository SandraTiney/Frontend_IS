import "../style/usuarios.css";
import { useState, useEffect } from "react";
import Axios from "axios";
import Swal from "sweetalert2";
import { AllowedAccess } from 'react-permission-role';
import NoPermission from "./NoPermission";

function Empleado() {
  const [id, setId] = useState("");
  const [primerNombre, setprimerNombre] = useState("");
  const [segundoNombre, setsegundoNombre] = useState("");
  const [primerApellido, setprimerApellido] = useState("");
  const [segundoApellido, setsegundoApellido] = useState("");
  const [telefono, settelefono] = useState("");
  const [email, setemail] = useState("");
  const [personalist, setpersona] = useState([]);
  const [editar, seteditarpersona] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [searchTerm, setSearchTerm] = useState("");

  const add = () => {
    Axios.post("http://localhost:3001/create", {
      primer_nombre: primerNombre,
      segundo_nombre: segundoNombre,
      primer_apellido: primerApellido,
      segundo_apellido: segundoApellido,
      telefono: telefono,
      email: email,
    }).then(() => {
      getPersona();
      limpiarcampos();
      Swal.fire({
        title: "<strong>Registro exitoso!!!</strong>",
        html: `<i><strong>${primerNombre} ${primerApellido}</strong> fue registrado con éxito</i>`,
        icon: "success",
        timer: 3000,
      });
    });
  };

  const update = () => {
    Axios.put("http://localhost:3001/update", {
      id: id,
      primer_nombre: primerNombre,
      segundo_nombre: segundoNombre,
      primer_apellido: primerApellido,
      segundo_apellido: segundoApellido,
      telefono: telefono,
      email: email,
    }).then(() => {
      getPersona();
      limpiarcampos();
      Swal.fire({
        title: "<strong>Actualización exitosa!!!</strong>",
        html: `<i><strong>${primerNombre} ${primerApellido}</strong> fue actualizado con éxito</i>`,
        icon: "success",
        timer: 2500,
      });
    }).catch((error) => {
      console.error("Error actualizando los datos:", error);
      Swal.fire({
        title: "<strong>Error de actualización</strong>",
        html: "<i>Ocurrió un error al actualizar los datos. Inténtalo de nuevo.</i>",
        icon: "error",
      });
    });
  };


  const limpiarcampos = () => {
    setprimerNombre("");
    setsegundoNombre("");
    setprimerApellido("");
    setsegundoApellido("");
    settelefono("");
    setemail("");
    setId("");
    seteditarpersona(false);
  };

  const editarpersona = (val) => {
    seteditarpersona(true);
    setprimerNombre(val.primer_nombre);
    setsegundoNombre(val.segundo_nombre);
    setprimerApellido(val.primer_apellido);
    setsegundoApellido(val.segundo_apellido);
    settelefono(val.telefono);
    setemail(val.email);
    setId(val.id);
  };

  const getPersona = () => {
    Axios.get("http://localhost:3001/obtenerlistapersonas").then((response) => {
      setpersona(response.data);
    });
  };

  useEffect(() => {
    getPersona();
  }, []);

  const filteredPersonalist = personalist.filter((persona) => {
    return (
      persona.primer_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.segundo_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.primer_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.segundo_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.telefono.includes(searchTerm) ||
      persona.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPersonalist.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPersonalist.length / itemsPerPage);
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
        <div className="card">
          <div className="card-header">FORMULARIO DE EMPLEADOS</div>
          <div className="card-content">
            {/* Formulario de entrada de datos */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Primer nombre:</label>
                <input
                  type="text"
                  onChange={(event) => setprimerNombre(event.target.value)}
                  className="form-input"
                  value={primerNombre}
                  placeholder=""
                />
              </div>
              <div className="form-group">
                <label className="form-label">Segundo Nombre:</label>
                <input
                  type="text"
                  onChange={(event) => setsegundoNombre(event.target.value)}
                  value={segundoNombre}
                  className="form-input"
                  placeholder=""
                />
              </div>
              <div className="form-group">
                <label className="form-label">Primer Apellido:</label>
                <input
                  type="text"
                  onChange={(event) => setprimerApellido(event.target.value)}
                  value={primerApellido}
                  className="form-input"
                  placeholder=""
                />
              </div>
              <div className="form-group">
                <label className="form-label">Segundo Apellido:</label>
                <input
                  type="text"
                  onChange={(event) => setsegundoApellido(event.target.value)}
                  value={segundoApellido}
                  className="form-input"
                  placeholder=""
                />
              </div>
              <div className="form-group">
                <label className="form-label">Telefono:</label>
                <input
                  type="number"
                  onChange={(event) => settelefono(event.target.value)}
                  value={telefono}
                  className="form-input"
                  placeholder=""
                />
              </div>
              <div className="form-group">
                <label className="form-label">Direccion:</label>
                <input
                  type="text"
                  onChange={(event) => setemail(event.target.value)}
                  value={email}
                  className="form-input"
                  placeholder=""
                />
              </div>
            </div>
          </div>
          <div className="card-footer">
            {editar ? (
              <div>
                <button className="btn btn-warning m-2" onClick={update}>Actualizar persona</button>
                <button className="btn btn-info m-2" onClick={limpiarcampos}>Cancelar</button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={add}>Registrar</button>
            )}
          </div>
        </div>

        {/* Buscador */}
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="search-input" 
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <span className="search-icon"></span>
        </div>

        {/* Tabla de datos */}
        <div className="table-container">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Telefono</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((val) => (
                <tr key={val.id}>
                  <td>{val.primer_nombre} {val.segundo_nombre} {val.primer_apellido} {val.segundo_apellido}</td>
                  <td>{val.telefono}</td>
                  <td>{val.email}</td>
                  <td>
                    <button className="btn btn-info m-2" onClick={() => editarpersona(val)}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="pagination">
          {pageNumbers.map((number) => (
            <button
              key={number}
              className={`btn btn-light ${currentPage === number ? "active" : ""}`}
              onClick={() => paginate(number)}
            >
              {number}
            </button>
          ))}
        </div>
      </div>
    </AllowedAccess>
  );
}

export default Empleado;
