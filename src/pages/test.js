

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // Asegúrate de tener esta librería instalada
import "../style/mesero.css";

const Mesero = () => {
    const [categorias, setCategorias] = useState([]);
    const [platillos, setPlatillos] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [pedido, setPedido] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
    const [fechaActual, setFechaActual] = useState('');
    const [idUsuario, setIdUsuario] = useState("");
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        obtenerCategorias();
        obtenerMesas();
        obtenerFechaActual();
        // Establecer el idUsuario desde el almacenamiento local
        const usuario = localStorage.getItem('idUsuario'); // Asegúrate de que este valor esté disponible
        setIdUsuario(usuario);
    }, []);

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
    
    const obtenerCategorias = async () => {
        try {
            const response = await axios.get('http://localhost:3001/categoria/listar');
            setCategorias(response.data);
        } catch (error) {
            console.error('Error al obtener categorías', error);
        }
    };

    const obtenerMesas = async () => {
        try {
            const response = await axios.get('http://localhost:3001/mesas/listar');
            setMesas(response.data);
        } catch (error) {
            console.error('Error al obtener mesas', error);
        }
    };

    const obtenerFechaActual = () => {
        const fecha = new Date();
        const opcionesFormato = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        setFechaActual(fecha.toLocaleString('es-ES', opcionesFormato));
    };

    const handleCategoriaClick = (categoriaId) => {
        setCategoriaSeleccionada(categoriaId);
        obtenerPlatillos(categoriaId);
    };

    const obtenerPlatillos = async (categoriaId) => {
        try {
            const response = await axios.get('http://localhost:3001/platillos/listar');
            const platillosFiltrados = response.data.filter(platillo => platillo.categoria_id === categoriaId);
            setPlatillos(platillosFiltrados);
        } catch (error) {
            console.error('Error al obtener platillos', error);
        }
    };

    const agregarPlatillo = (platillo) => {
        setPedido(prevPedido => {
            const existe = prevPedido.find(item => item.id === platillo.id);
            if (existe) {
                return prevPedido.map(item =>
                    item.id === platillo.id ? { ...item, cantidad: item.cantidad + 1 } : item
                );
            }
            return [...prevPedido, { ...platillo, cantidad: 1 }];
        });
    };

    const quitarPlatillo = (platillo) => {
        setPedido(prevPedido => {
            return prevPedido.reduce((acc, item) => {
                if (item.id === platillo.id) {
                    if (item.cantidad > 1) {
                        return [...acc, { ...item, cantidad: item.cantidad - 1 }];
                    }
                    return acc;
                }
                return [...acc, item];
            }, []);
        });
    };

    const handleMesaChange = (e) => {
        setMesaSeleccionada(e.target.value);
    };

    // Guardar nueva orden
    const addOrden = async () => {
        const total = pedido.reduce((total, item) => total + parseFloat(item.precio) * item.cantidad, 0).toFixed(2);
        try {
            await axios.post("http://localhost:3001/orden/guardar", {
                id_usuario: idUsuario,
                mesa_id: mesaSeleccionada, // Cambié mesaId por mesaSeleccionada
                fecha_orden: fechaActual, // Cambié fechaOrden por fechaActual
                total: total,
            });
            // Aquí puedes llamar a la función para obtener la lista de órdenes, si es necesario
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

    const limpiarCampos = () => {
        setPedido([]);
        setMesaSeleccionada(null);
        setCategoriaSeleccionada(null);
        setPlatillos([]);
    };

    const handleContinuar = () => {
        Swal.fire({
            title: "<strong>Orden registrada!</strong>",
            html: "<i>Orden guardada exitosamente</i>",
            icon: "success",
            timer: 3000,
        });
        console.log('Continuar con la mesa:', mesaSeleccionada);
        limpiarCampos();
    };

return (
    <div className="nuevo-container">
        <div className="header-informacion">
            <h1 className="titulo-generar-orden">Generar Orden</h1> {/* Título agregado */}
            <div className="info-frame">
                <select value={idUsuario} onChange={(e) => setIdUsuario(e.target.value)}>
                    <option value="">Seleccione un usuario</option>
                    {usuarios.map((usuario) => (
                        <option key={usuario.id} value={usuario.id}>
                            {usuario.id_usuario}
                        </option>
                    ))}
                </select>
                <p>Fecha y Hora: {fechaActual}</p>
                <div className="mesa-seleccion">
                    <label htmlFor="mesa">Seleccionar Mesa:</label>
                    <select id="mesa" value={mesaSeleccionada} onChange={handleMesaChange}>
                        <option value="">-- Selecciona una mesa --</option>
                        {mesas.map((mesa) => (
                            <option key={mesa.id} value={mesa.id}>
                                Mesa {mesa.numero}
                            </option>
                        ))}
                    </select>
                </div>
                <br />
                <button className="continuar-btn" onClick={addOrden}>Continuar</button>
            </div>
        </div>

        <h1>Menú de Platillos</h1>
        <div className="nueva-categorias">
            {categorias.map((categoria) => (
                <button
                    key={categoria.id}
                    className={`nueva-categoria-btn ${categoriaSeleccionada === categoria.id ? 'active' : ''}`}
                    onClick={() => handleCategoriaClick(categoria.id)}
                >
                    {categoria.nombre}
                </button>
            ))}
        </div>
        <div className="nuevo-menu">
            {platillos.map((platillo) => (
                <div key={platillo.id} className="nuevo-platillo">
                    <p>
                        <img src={platillo.imagen} alt={platillo.nombre} style={{ width: '100px', height: 'auto' }} />
                    </p>
                    <p>{platillo.nombre}</p>
                    <p>Precio: {platillo.precio}</p>
                    <div className="cantidad-control">
                        <button 
                            className="menos-btn" 
                            onClick={() => quitarPlatillo(platillo)}
                            disabled={!pedido.some(item => item.id === platillo.id)}
                        >
                            -
                        </button>
                        <span>
                            {pedido.find(item => item.id === platillo.id)?.cantidad || 0}
                        </span>
                        <button 
                            className="mas-btn" 
                            onClick={() => agregarPlatillo(platillo)}
                        >
                            +
                        </button>
                    </div>
                </div>
            ))}
        </div>
        <div className="nuevo-resumen resumen-naranja">
            <h2>Resumen del Pedido</h2>
            <div id="items-pedido">
                {pedido.map((item) => (
                    <p key={item.id}>{item.nombre} - {item.cantidad} x Q{item.precio}</p>
                ))}
            </div>
            <p className="nuevo-total">
                Total: Q{pedido.reduce((total, item) => total + parseFloat(item.precio) * item.cantidad, 0).toFixed(2)}
            </p>
            <button className="nuevo-finalizar-btn" onClick={handleContinuar}>Finalizar Pedido </button>
        </div>  
    </div>
);
};

export default Mesero;
