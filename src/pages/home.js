import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [estadisticas, setEstadisticas] = useState({
    totalOrdenesHoy: 0,
    totalClientesActivos: 0,
    ultimasOrdenes: []
  });

  useEffect(() => {
    // Fetching estadisticas data from the backend
    const fetchEstadisticas = async () => {
      try {
        const response = await axios.get('http://localhost:3001/reporte/estadisticas');
        setEstadisticas(response.data);
      } catch (error) {
        console.error('Error al obtener las estadísticas', error);
      }
    };
    fetchEstadisticas();
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Estadísticas del Restaurante</h1>

      <div className="row justify-content-center">
  {/* Total de órdenes hoy */}
  <div className="col-md-4 d-flex justify-content-center">
    <div className="card">
      <div className="card-header text-center">
        Total de órdenes hoy
      </div>
      <div className="card-body text-center">
        <h1 className="card-title">{estadisticas.totalOrdenesHoy}</h1>
        <p className="card-text">Órdenes pendientes, preparando o entregadas hoy.</p>
      </div>
    </div>
  </div>

  {/* Total de clientes activos */}
  <div className="col-md-4 d-flex justify-content-center">
    <div className="card">
      <div className="card-header text-center">
        Total de clientes activos
      </div>
      <div className="card-body text-center">
        <h1 className="card-title">{estadisticas.totalClientesActivos}</h1>
        <p className="card-text">Clientes activos con NIT.</p>
      </div>
    </div>
  </div>
</div>

      {/* Últimas órdenes procesadas - Se mueve hacia abajo */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              Últimas órdenes procesadas
            </div>
            <ul className="list-group list-group-flush">
              {estadisticas.ultimasOrdenes.length > 0 ? (
                estadisticas.ultimasOrdenes.map((orden) => (
                  <li key={orden.id} className="list-group-item">
                    <strong>Orden #{orden.id}</strong> - 
                    <span>Mesa {orden.mesa_id}</span> - 
                    <span>Estado: {orden.estado}</span> - 
                    <span>Mesero: {orden.mesero}</span> - 
                    <span>Hora: {orden.hora_orden}</span>
                  </li>
                ))
              ) : (
                <li className="list-group-item">No hay órdenes recientes.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
