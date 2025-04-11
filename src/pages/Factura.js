import React, { useState, useEffect } from 'react';
import Axios from "axios";
import '../style/Historial.css';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';

const Historial = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isNewClient, setIsNewClient] = useState(false);
  /*const [selectedDate, setSelectedDate] = useState(new Date());*/
  const [searchClient, setSearchClient] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [showClientSearch, setShowClientSearch] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [clients, setClients] = useState([]); 
  const [customerData, setCustomerData] = useState({
    nit_cliente: '',
    nombre: '',
    apellido: '',
    direccion: '',
  });

  const [idUsuario, setIdUsuario] = useState("");
  const [usuario, setUsuario] = useState("");
  const [ordenes, setOrdenes] = useState([]);
  const [expandedRows, setExpandedRows] = useState({}); 
 /* const [orderId, setOrderId] = useState(null); */

  function getUserData() {
    const userData = localStorage.getItem('user');
    console.log(localStorage.getItem('user'));
    if (userData) {
      return JSON.parse(userData); 
    }
    return null;
  }

  useEffect(() => {
    const user = getUserData();
    if (user) {
      setIdUsuario(user.id_usuario); 
      setUsuario(user);
      getOrdenEntregados(user.id_usuario); 
      getClients(); 
    } else {
      console.log('No hay datos del usuario en local storage.');
    }
  }, []);

  const getOrdenEntregados = async  (usuarioId) => {
    try{
      const response = await Axios.get(`http://localhost:3001/orden/ordenes-entregados/${usuarioId}`);
      setOrdenes(response.data.ordenes); 
    } catch (error) {
      console.error("Error al obtener las órdenes entregadas:", error);
    }
  };

  const toggleRowExpansion = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index], 
    }));
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  const openClientModal = (isNew) => {
    setIsNewClient(isNew);
    if (isNew) {
      setCustomerData({
        nit_cliente: '',
        nombre: '',
        apellido: '',
        direccion: '',
      });
    }
    setIsClientModalOpen(true);
    setShowClientSearch(true);
  };

  const closeClientModal = () => {
    setIsClientModalOpen(false);
    setShowClientSearch(true);
    setShowAlert(false);
  };

  const handleCustomerDataChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCreateClient = async () => {
    try {

      const camposRequeridos = {
        'NIT': customerData.nit_cliente,
        'Nombre': customerData.nombre,
        'Apellido': customerData.apellido,
        'Dirección': customerData.direccion
      };
  
      const camposFaltantes = Object.entries(camposRequeridos)
        .filter(([_, valor]) => !valor || valor.trim() === '')
        .map(([campo]) => campo);
  
      if (camposFaltantes.length > 0) {
        await Swal.fire({
          icon: 'error',
          title: 'Campos Incompletos',
          text: `Los siguientes campos son obligatorios: ${camposFaltantes.join(', ')}`,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Entendido'
        });
        return;
      }
      const validaciones = [
        {
          condicion: customerData.nit_cliente.length > 12,
          mensaje: 'El NIT no puede tener más de 12 caracteres'
        },
        {
          condicion: customerData.nombre.length > 100,
          mensaje: 'El nombre no puede tener más de 100 caracteres'
        },
        {
          condicion: customerData.apellido.length > 100,
          mensaje: 'El apellido no puede tener más de 100 caracteres'
        },
        {
          condicion: customerData.direccion.length > 150,
          mensaje: 'La dirección no puede tener más de 150 caracteres'
        }
      ];
  
      const errorLongitud = validaciones.find(v => v.condicion);
      if (errorLongitud) {
        await Swal.fire({
          icon: 'error',
          title: 'Error de Validación',
          text: errorLongitud.mensaje,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Entendido'
        });
        return;
      }
      Swal.fire({
        title: 'Guardando cliente...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
  
      await Axios.post('http://localhost:3001/cliente/guardar', customerData);
      
      await Swal.fire({
        icon: 'success',
        title: '¡Cliente Creado!',
        text: 'El cliente se ha registrado exitosamente',
        confirmButtonColor: '#3085d6',
        timer: 2000,
        timerProgressBar: true
      });
  
      closeClientModal(); 
      getClients(); 
  
    } catch (error) {
      console.error("Error al crear el cliente:", error);
      
      let errorMessage = 'Error al crear el cliente';
      
      if (error.response) {

        errorMessage = error.response.data.mensaje || errorMessage;
        if (error.response.status === 409) {
          errorMessage = 'Ya existe un cliente con este NIT';
        }
      }
  
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
    }
  };

  const getClients = async () => {
    try {
        const response = await Axios.get("http://localhost:3001/cliente/listar"); 
        console.log("Clientes obtenidos:", response.data);
        setClients(response.data); 
        setFilteredClients(response.data); 
    } catch (error) {
        console.error("Error al obtener los clientes:", error);
    }
};
/*const handleOrderSelection = (id) => {
  setOrderId(id);
};*/

 const handleClientSelect = (client) => {
  setCustomerData(client);
  setShowAlert(true);
  setShowClientSearch(false);
    
  setTimeout(() => {
    setShowAlert(false);
  }, 2000);
};


const handleSearchClientChange = (e) => {
  const value = e.target.value;
  setSearchClient(value);
  if (value) {
    const filtered = clients.filter((client) =>
      client.nombre.toLowerCase().includes(value.toLowerCase()) ||
      client.apellido.toLowerCase().includes(value.toLowerCase()) ||
      client.nit_cliente.includes(value)
    );
    setFilteredClients(filtered);
  } else {
    setFilteredClients(clients);
  }
};
const handleGenerateInvoice = async (id_orden) => {
  const clienteId = customerData.id; 
  const ordenId = id_orden;
  try {
      const response = await Axios.post('http://localhost:3001/factura/guardar', {
          cliente_id: clienteId,
          orden_id: ordenId
      });

      // Verificar la respuesta en el frontend
      console.log('Respuesta de la API:', response.data);

      const invoiceId = response.data.id; // Ahora debería ser el ID generado
      if (invoiceId) {
          await Swal.fire({
              icon: 'success',
              title: '¡Factura Generada!',
              text: `Factura generada exitosamente con ID:${invoiceId}`,
              confirmButtonColor: '#3085d6',
              timer: 2000,
              timerProgressBar: true
          });

          generatePDF();
          closeModal();
          closeClientModal();
      } else {
          console.error("Error: No se recibió el ID de la factura.");
      }
  } catch (error) {
      console.error("Error al generar la factura:", error);

      let errorMessage = 'Error al generar la factura';
      await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#3085d6'
      });
  }
};


/*
    const handleGenerateInvoice = async (id_orden) => {
      const clienteId = customerData.id; 
      const ordenId = id_orden;
      try {
        const response = await Axios.post('http://localhost:3001/factura/guardar', {
          cliente_id: clienteId,
          orden_id: ordenId
        });
        //const invoiceId = response.data.id;
        await Swal.fire({
          icon: 'success',
          title: '¡Factura Generada!',
          text: `Factura generada exitosamente con ID:${id_orden}`,
          confirmButtonColor: '#3085d6',
          timer: 2000,
          timerProgressBar: true
        });   
        generatePDF();

        closeModal(); 
        closeClientModal();
    
        
      } catch (error) {
        console.error("Error al generar la factura:", error);
        
        let errorMessage = 'Error al generar la factura';
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#3085d6'
        });
      }
    };
*/
    const generatePDF = () => {
      if (!selectedOrder || !selectedOrder.items) {
        console.error("No hay datos de la orden seleccionada para generar el PDF.");
        return;
      }
    
      const doc = new jsPDF();
      
      // Configuración de fuente y título
      doc.setFontSize(12);
      const restaurantText = 'Restaurante Miralago, Panajachel';
      const pageWidth = doc.internal.pageSize.width;
      const textWidth = doc.getTextWidth(restaurantText);
      const centeredX = (pageWidth - textWidth) / 2;
      doc.text(restaurantText, centeredX, 20);
  
  doc.setFont("helvetica", "normal"); // Regresar a la fuente normal
  doc.text(`Fecha y hora: ${selectedOrder.fechaOrden || 'No especificada'}`, 10, 30);
  doc.text(`NIT: ${customerData.nit_cliente || 'No especificado'}`, 10, 40);
  doc.text(`Nombre: ${customerData.nombre || ''} ${customerData.apellido || ''}`, 70, 40);
  doc.text(`Dirección: ${customerData.direccion || 'No especificada'}`, 10, 50);
  
  // Listado de Items
  doc.setFont("helvetica", "bold"); // Encabezado en negrita para "Detalle Factura"
  doc.text('Detalle Factura:', 10, 60);
  doc.text('Descripcion:', 10, 70);
  doc.text('Cantidad:', 100, 70);
  doc.text('Precio:', 130, 70);
  doc.text('Subtotal:', 160, 70);

    doc.setFont("helvetica", "normal"); // Regresar a la fuente normal
        // Listado de Items
  let totalOrden = 0;
  selectedOrder.items.forEach((item, index) => {
    const itemName = item.nombre || item.descripcion || 'Item sin nombre';
    const itemQuantity = item.cantidad || 1;
    const itemSubtotal = item.subtotal;
    const itemPrice = itemQuantity > 0 ? (itemSubtotal / itemQuantity) : 0;

    // Alinear cada campo de ítem en su columna respectiva
    const rowY = 80 + index * 10;
    doc.text(itemName, 10, rowY);               // Descripción
    doc.text(`${itemQuantity}`, 100, rowY);     // Cantidad
    doc.text(`Q${itemPrice}`, 130, rowY);       // Precio
    doc.text(`Q${itemSubtotal}`, 160, rowY);    // Subtotal

    totalOrden += Number(itemSubtotal);; // Acumular el subtotal en el total de la orden
  });

  // Mostrar el total de la orden después de la lista de ítems
  let itemsEndPosition = 80 + selectedOrder.items.length * 10;
  doc.text(`Total de la Orden: Q ${totalOrden}`, 10, itemsEndPosition + 10);

  doc.save('Factura_Orden.pdf');
    };
    
    
    


  return (
    <div className="historial-container">
      <p><strong>Ordenes del mesero:</strong> {usuario ? usuario.username : "No hay usuario logueado"}</p>
      <h1>Generar factura de las órdenes entregadas</h1>
      <div className="order-list">
        <table>
          <thead>
            <tr>
              <th>Fecha Completada</th>
              <th>Número de Orden</th> 
              <th>Mesa</th>
              <th>Items</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((order, index) => (
              <React.Fragment key={index}>
                {/* Fila principal */}
                <tr onClick={() => toggleRowExpansion(index)} style={{ cursor: 'pointer' }}>
                  <td>{new Date(order.fechaOrden).toLocaleDateString()}</td> 
                  <td>{order.ordenId}</td>
                  <td>{order.mesaId}</td>
                  <td>{order.items.length} Items</td>
                  <td>
                  <button onClick={() => openModal(order)} className="details-button">
                    Ver Detalles
                  </button>
                  </td>
                </tr>
                {expandedRows[index] && (
                  <tr>
                    <td colSpan="5">
                      <div className="expanded-row">
                        {order.items.map((item, i) => (
                          <div key={i}>
                            {item.cantidad}  {item.nombre} , Subtotal: Q{item.subtotal}  </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && selectedOrder && (
    <div className="modal-overlay" onClick={closeModal}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="close-button" onClick={closeModal}>X</button>
      <h2>Detalles de la Orden</h2>
      <p><strong>Mesa:</strong> {selectedOrder.mesaId}</p>
      <p><strong>Orden:</strong> {selectedOrder.ordenId}</p>
      <p><strong>Items:</strong></p>
      <ul>
        {selectedOrder.items.map((item, index) => (
          <li key={index}>{item.cantidad} x {item.nombre}, Subtotal: Q{item.subtotal}</li>
        ))}
      </ul>
      <p><strong>Fecha Completada:</strong> {new Date(selectedOrder.fechaOrden).toLocaleDateString()}</p> {/* Formato de fecha */}
      <button onClick={() => openClientModal(true)} className="generate-invoice-button">
              Cliente Nuevo
            </button>
            <button onClick={() => openClientModal(false)} className="generate-invoice-button">
              Cliente Existente
            </button>
    </div>
  </div>
      )}

      {isClientModalOpen && (
        <div className="modal-overlay" onClick={closeClientModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeClientModal}>X</button>
            <h2>{isNewClient ? 'Nuevo Cliente' : 'Cliente Existente'}</h2>

            {showAlert && (
              <div className="mb-4 p-4 rounded bg-green-100 text-green-700 flex items-center">
                   <div className="mr-2">✓</div>
               <div>Cliente seleccionado exitosamente.</div> 
              </div>
            )}
            {selectedOrder && (
              <>
                <p><strong>Resumen de la Orden:</strong></p>
                <p>Mesa: {selectedOrder.mesaId}</p>
                <p><strong>Orden:</strong> {selectedOrder.ordenId}</p>
                <p><strong>Items:</strong></p>
                <ul>
                  {selectedOrder.items.map((item, index) => (
                    <li key={index}>{item.cantidad} x {item.nombre}, Subtotal: Q{item.subtotal}</li>
                  ))}
                </ul>
              </>
            )}

            {isNewClient ? (
              <>
                {/* Formulario para nuevo cliente */}
                <label>Nit:</label>
                <input 
                  type="text" 
                  name="nit_cliente" 
                  value={customerData.nit_cliente} 
                  onChange={handleCustomerDataChange} />
                
                <label>Nombres:</label>
                <input 
                  type="text" 
                  name="nombre" 
                  value={customerData.nombre} 
                  onChange={handleCustomerDataChange} />
                
                <label>Apellidos:</label>
                <input 
                type="text" 
                name="apellido" 
                value={customerData.apellido} 
                onChange={handleCustomerDataChange} 
              />
                
                <label>Dirección:</label>
                <input 
                  type="text" 
                  name="direccion" 
                  value={customerData.direccion} 
                  onChange={handleCustomerDataChange} 
                />
              <button  className="generate-invoice-button mt-4" onClick={handleCreateClient}>
                Crear Cliente
              </button>
              </>
            ) : (
              <>
                {showClientSearch ? (
                  <>
                    <label>Buscar Cliente:</label>
                    <input
                      type="text"
                      value={searchClient}
                      onChange={handleSearchClientChange}
                      placeholder="Buscar..."
                    />
                    <div className="client-search-results">
                      {filteredClients.map((client, index) => (
                        <div 
                          key={index} 
                          onClick={() => handleClientSelect(client)}
                          className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                        >
                          {client.nombre} {client.apellido} - {client.nit_cliente}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="selected-client-info p-4 bg-gray-50 rounded mt-4">
                      <p><strong>Datos del Cliente:</strong></p>
                      <p>NIT: {customerData.nit_cliente}</p>
                      <p>Nombre: {customerData.nombre} {customerData.apellido}</p>
                      <p>Dirección: {customerData.direccion}</p>
                    </div>
                  </>
                )}
              </>
            )}
              <button type='submit' className="generate-invoice-button mt-4" onClick={()=>handleGenerateInvoice(selectedOrder.ordenId)}>
                Crear Factura
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historial;