import "../style/usuarios.css"; 
import { useState, useEffect } from "react"; 
import Axios from "axios"; 
import Swal from "sweetalert2"; 
import { AllowedAccess } from 'react-permission-role'; 
import NoPermission from "./NoPermission"; 

function Cliente() { 
    const [id, setId] = useState(""); 
    const [nitCliente, setNitCliente] = useState(""); 
    const [nombre, setNombre] = useState(""); 
    const [apellido, setApellido] = useState(""); 
    const [direccion, setDireccion] = useState(""); 
    const [clienteList, setClienteList] = useState([]); 
    const [editar, setEditarCliente] = useState(false); 
    const [currentPage, setCurrentPage] = useState(1); 
    const itemsPerPage = 5; 
    const [searchTerm, setSearchTerm] = useState(""); 

    const addCliente = () => { 
        Axios.post("http://localhost:3001/cliente/guardar", { 
            nit_cliente: nitCliente, 
            nombre: nombre, 
            apellido: apellido, 
            direccion: direccion
        }).then(() => { 
            getClientes(); 
            limpiarCampos(); 
            Swal.fire({ title: "<strong>Registro exitoso!!!</strong>", html: `<i><strong>${nombre} ${apellido}</strong> fue registrado con éxito</i>`, icon: "success", timer: 3000 }); 
        }).catch((error) => { 
            console.error("Error al guardar cliente:", error); 
            Swal.fire({ title: "<strong>Error al guardar</strong>", html: "<i>Ocurrió un error al guardar el cliente. Inténtalo de nuevo.</i>", icon: "error" }); 
        }); 
    }; 

    const updateCliente = () => { 
        Axios.put("http://localhost:3001/cliente/actualizar", { 
            id: id, 
            nit_cliente: nitCliente, 
            nombre: nombre, 
            apellido: apellido, 
            direccion: direccion
        }).then(() => { 
            getClientes(); 
            limpiarCampos(); 
            Swal.fire({ title: "<strong>Actualización exitosa!!!</strong>", html: `<i><strong>${nombre} ${apellido}</strong> fue actualizado con éxito</i>`, icon: "success", timer: 2500 }); 
        }).catch((error) => { 
            console.error("Error actualizando los datos:", error); 
            Swal.fire({ title: "<strong>Error de actualización</strong>", html: "<i>Ocurrió un error al actualizar los datos. Inténtalo de nuevo.</i>", icon: "error" }); 
        }); 
    }; 


    const limpiarCampos = () => { 
        setNitCliente(""); setNombre(""); setApellido(""); setDireccion(""); setId(""); setEditarCliente(false); 
    }; 

    const editarClienteFunc = (val) => { 
        setEditarCliente(true); setNitCliente(val.nit_cliente); setNombre(val.nombre); setApellido(val.apellido); setDireccion(val.direccion); setId(val.id); 
    }; 

    const getClientes = () => { Axios.get("http://localhost:3001/cliente/listar").then((response) => { setClienteList(response.data); }); }; 

    useEffect(() => { getClientes(); }, []); 

    const filteredClientList = clienteList.filter((cliente) => { return ( cliente.nit_cliente.includes(searchTerm) || cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) || cliente.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ); }); 

    const indexOfLastItem = currentPage * itemsPerPage; 
    const indexOfFirstItem = indexOfLastItem - itemsPerPage; 
    const currentItems = filteredClientList.slice(indexOfFirstItem, indexOfLastItem); 

    const totalPages = Math.ceil(filteredClientList.length / itemsPerPage); 

    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1); 

    const paginate = (pageNumber) => setCurrentPage(pageNumber); 

    return (  
        <AllowedAccess roles={["admin"]} permissions="manage-users" renderAuthFailed={<NoPermission/>} isLoading={<p>Cargando...</p>} >  
            <div className="container">  
                <div className="card">  
                    <div className="card-header">FORMULARIO DE CLIENTES</div>  
                    <div className="card-content">  
                        {/* Formulario de entrada de datos */}  
                        <div className="form-grid">  
                            <div className="form-group">  
                                <label className="form-label">NIT Cliente:</label>  
                                <input type="text" onChange={(event) => setNitCliente(event.target.value)} className="form-input" value={nitCliente} placeholder="" />  
                            </div>  
                            <div className="form-group">  
                                <label className="form-label">Nombre:</label>  
                                <input type="text" onChange={(event) => setNombre(event.target.value)} value={nombre} className="form-input" placeholder="" />  
                            </div>  
                            <div className="form-group">  
                                <label className="form-label">Apellido:</label>  
                                <input type="text" onChange={(event) => setApellido(event.target.value)} value={apellido} className="form-input" placeholder="" />  
                            </div>  
                            <div className="form-group">  
                                <label className="form-label">Dirección:</label>  
                                <input type="text" onChange={(event) => setDireccion(event.target.value)} value={direccion} className="form-input" placeholder="" />  
                            </div>  
                        </div>  
                    </div>

                    <div className="card-footer">  
                        {editar ? (  
                            <div>  
                                <button className="btn btn-warning m-2" onClick={updateCliente}>Actualizar cliente</button>  
                                <button className="btn btn-info m-2" onClick={limpiarCampos}>Cancelar</button>  
                            </div>   
                        ) : (   
                            <button className="btn btn-primary" onClick={addCliente}>Registrar</button>
                        )}   
                    </div>
                </div>

                {/* Buscador */}   
                <div className="search-container">   
                    <input type="text" placeholder="Buscar..." className="search-input" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />   
                    <span className="search-icon"></span>   
                </div>

                {/* Tabla de datos */}   
                <div className="table-container">   
                    <table className="table table-bordered">   
                        <thead>   
                            <tr>   
                                <th>NIT Cliente</th>   
                                <th>Nombre</th>   
                                <th>Apellido</th>   
                                <th>Dirección</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((val) => (
                                <tr key={val.id}>
                                    <td>{val.nit_cliente}</td>
                                    <td>{val.nombre}</td>
                                    <td>{val.apellido}</td>
                                    <td>{val.direccion}</td>
                                    <td>
                                        <button className="btn btn-info m-2" onClick={() => editarClienteFunc(val)}>Editar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}   
                <div className="pagination">   
                    {pageNumbers.map((number) => (   
                        <button key={number} className={`btn btn-light ${currentPage === number ? "active" : ""}`} onClick={() => paginate(number)}>   
                            {number}
                        </button>
                    ))}   
                </div>
            </div>
        </AllowedAccess>
    );   
}

export default Cliente;