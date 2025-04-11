import React, { useState, useEffect } from 'react';
import Axios from "axios";
import '../style/Historial.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { jsPDF } from 'jspdf';

const orders = [
  {
    mesa: 'Mesa 5',
    mesero: 'Ana',
    items: ['2x Pasta', '1x Tiramisu'],
    tiempoPreparacion: '20 minutos',
    fechaCompletada: '3/11/2024, 20:10:39',
  },
  {
    mesa: 'Mesa 8',
    mesero: 'Luis',
    items: ['3x Sushi', '1x Sake'],
    tiempoPreparacion: '25 minutos',
    fechaCompletada: '3/11/2024, 19:15:39',
  },
];

const clients = [
  { nit: '123456789', nombres: 'Carlos', apellidos: 'González', direccion: 'Calle Ficticia 123' },
  { nit: '987654321', nombres: 'María', apellidos: 'Lopez', direccion: 'Avenida Real 456' },
  { nit: '456789123', nombres: 'José', apellidos: 'Martínez', direccion: 'Barrio Nuevo 789' },
];

const Historial = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isNewClient, setIsNewClient] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customerData, setCustomerData] = useState({
    nit: '',
    nombres: '',
    apellidos: '',
    direccion: '',
  });
  const [searchClient, setSearchClient] = useState('');
  const [filteredClients, setFilteredClients] = useState(clients);
  const [showClientSearch, setShowClientSearch] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [idUsuario, setIdUsuario] = useState("");
  const [usuario, setUsuario] = useState("");
  const [ordenes, setOrdenes] = useState([]);
  /*const [ordenId, setOrdenId] = useState("");
  const [fecha, setFechaEntregado] = useState("");
  const [mesaId, setMesaId] = useState("");
  const [mesero, setMesero] = useState("");
  const [detalleId, setDetalleId]= useState("");
  const [platillos, setPlatillosID] = useState("");*/

  function getUserData() {
    const userData = localStorage.getItem('user');
    if (userData) {
        return JSON.parse(userData); // Devuelve los datos del usuario como objeto
    }
    return null; // Si no hay datos, devuelve null
  }
  // Cargar ID de usuario al iniciar el componente
useEffect(() => {
  const user = getUserData();
  if (user) {
      setIdUsuario(user.id_usuario); // Establecer ID de usuario desde local storage
      setUsuario(user) 
      console.log('Datos del usuario:', user);
  } else {
      console.log('No hay datos del usuario en local storage.');
  }
 // obtenerCategorias(); 
  //obtenerMesas(); 
  //obtenerFechaActual(); 
}, []);

const getOrdenEntregados = () => {
  Axios.get("http://localhost:3001/orden/ordenes-entregados/3").then((response) => {
    setOrdenes(response.data);
  });
};

useEffect(() => {
  getOrdenEntregados();
}, []);


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
    setShowClientSearch(true);
    if (isNew) {
      setCustomerData({
        nit: '',
        nombres: '',
        apellidos: '',
        direccion: '',
      });
    }
    setIsClientModalOpen(true);
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

  const handleSearchClientChange = (e) => {
    setSearchClient(e.target.value);
    const filtered = clients.filter((client) =>
      client.nombres.toLowerCase().includes(e.target.value.toLowerCase()) ||
      client.apellidos.toLowerCase().includes(e.target.value.toLowerCase()) ||
      client.nit.includes(e.target.value)
    );
    setFilteredClients(filtered);
  };

  const handleClientSelect = (client) => {
    setCustomerData(client);
    setShowAlert(true);
    setShowClientSearch(false);
    
    // Ocultar la alerta después de 2 segundos
    setTimeout(() => {
      setShowAlert(false);
    }, 2000);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('Recibo de Orden', 10, 10);
    doc.text(`Mesa: ${selectedOrder.mesa}`, 10, 20);
    doc.text(`Mesero: ${selectedOrder.mesero}`, 10, 30);
    doc.text('Items:', 10, 40);

    selectedOrder.items.forEach((item, index) => {
      doc.text(`- ${item}`, 10, 50 + index * 10);
    });

    doc.text(`Tiempo de Preparación: ${selectedOrder.tiempoPreparacion}`, 10, 80);
    doc.text(`Fecha Completada: ${selectedOrder.fechaCompletada}`, 10, 90);
    doc.text('Datos del Cliente:', 10, 110);
    doc.text(`NIT: ${customerData.nit}`, 10, 120);
    doc.text(`Nombre: ${customerData.nombres} ${customerData.apellidos}`, 10, 130);
    doc.text(`Dirección: ${customerData.direccion}`, 10, 140);

    // Segunda copia
    doc.text('Recibo de Orden (Copia)', 10, 160);
    doc.text(`Mesa: ${selectedOrder.mesa}`, 10, 170);
    doc.text(`Mesero: ${selectedOrder.mesero}`, 10, 180);
    doc.text('Items:', 10, 190);

    selectedOrder.items.forEach((item, index) => {
      doc.text(`- ${item}`, 10, 200 + index * 10);
    });

    doc.text(`Tiempo de Preparación: ${selectedOrder.tiempoPreparacion}`, 10, 230);
    doc.text(`Fecha Completada: ${selectedOrder.fechaCompletada}`, 10, 240);
    doc.text('Datos del Cliente:', 10, 260);
    doc.text(`NIT: ${customerData.nit}`, 10, 270);
    doc.text(`Nombre: ${customerData.nombres} ${customerData.apellidos}`, 10, 280);
    doc.text(`Dirección: ${customerData.direccion}`, 10, 290);

    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl);
    closeClientModal();
  };

  return (
    
    <div className="historial-container">
      <p> <p><strong>Usuario logueado:</strong> {usuario ? usuario.username : "No hay usuario logueado"}</p></p>
      <h1>Generar factura de las ordenes entregadas</h1>
      <div className="header">
        <input type="text" placeholder="Buscar órdenes..." className="search-bar" />
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          className="date-picker"
          dateFormat="dd/MM/yyyy"
        />
      </div>
      <div className="order-list">
      <table>
                <thead>
                    <tr>
                        <th>Mesa</th>
                        <th>Mesero</th>
                        <th>Items</th>
                        <th>Fecha Completada</th>
                        <th>Detalles</th>
                    </tr>
                </thead>
                <tbody>
                    {ordenes.map((order, index) => (
                        <tr key={index}>
                            <td>{order.mesaId}</td> {/* Asegúrate de usar el nombre correcto */}
                            <td>{order.nombreMesero}</td> {/* Asegúrate de usar el nombre correcto */}
                            <td>
                                {order.items.map((item, i) => (
                                    <div key={i}>{item.nombre} (Cantidad: {item.cantidad})</div> 
                                ))}
                            </td>
                            <td>{new Date(order.fechaOrden).toLocaleDateString()}</td> {/* Formato de fecha */}
                            <td>
                                <button onClick={() => openModal(order)} className="details-button">
                                    Ver Detalles
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>X</button>
            <h2>Detalles de la Orden</h2>
            <p><strong>Mesa:</strong> {selectedOrder.mesa}</p>
            <p><strong>Mesero:</strong> {selectedOrder.mesero}</p>
            <p><strong>Items:</strong></p>
            <ul>
              {selectedOrder.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p><strong>Fecha Completada:</strong> {selectedOrder.fechaCompletada}</p>
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
                <div>Cliente seleccionado exitosamente</div>
              </div>
            )}

            <p><strong>Resumen de la Orden:</strong></p>
            <p>Mesa: {selectedOrder.mesa}</p>
            <p>Mesero: {selectedOrder.mesero}</p>
            <p>Items: {selectedOrder.items.join(', ')}</p>

            {isNewClient ? (
              <>
                <label>NIT:</label>
                <input
                  type="text"
                  name="nit"
                  value={customerData.nit}
                  onChange={handleCustomerDataChange}
                />
                <label>Nombres:</label>
                <input
                  type="text"
                  name="nombres"
                  value={customerData.nombres}
                  onChange={handleCustomerDataChange}
                />
                <label>Apellidos:</label>
                <input
                  type="text"
                  name="apellidos"
                  value={customerData.apellidos}
                  onChange={handleCustomerDataChange}
                />
                <label>Dirección:</label>
                <input
                  type="text"
                  name="direccion"
                  value={customerData.direccion}
                  onChange={handleCustomerDataChange}
                />
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
                          {client.nombres} {client.apellidos} - {client.nit}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="selected-client-info p-4 bg-gray-50 rounded mt-4">
                      <p><strong>Datos del Cliente:</strong></p>
                      <p>NIT: {customerData.nit}</p>
                      <p>Nombre: {customerData.nombres} {customerData.apellidos}</p>
                      <p>Dirección: {customerData.direccion}</p>
                    </div>
                  </>
                )}
              </>
            )}

            <button onClick={generatePDF} className="generate-invoice-button mt-4">
              Generar e Imprimir Factura
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historial;