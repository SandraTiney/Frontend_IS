import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'boxicons/css/boxicons.min.css';
import "../style/sidebar.css";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showRegistros, setShowRegistros] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showCocina, setShowCocina] = useState(false);
    const [showMesero, setShowMesero] =useState(false);
    const [showClientes, setShowClientes] =useState(false);
    const [showReportes, setShowReportes] =useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    const toggleRegistros = () => {
        setShowRegistros(!showRegistros);
        setShowMenu(false);
        setShowCocina(false);
    };

    const toggleClientes = () => {
        setShowClientes(!showClientes);
        setShowRegistros(false);
        setShowMenu(false);
    };

    const toggleMenu = () => {
        setShowMenu(!showMenu);
        setShowRegistros(false);
        setShowCocina(false);
    };

    const toggleCocina = () => {
        setShowCocina(!showCocina);
        setShowRegistros(false);
        setShowMenu(false);
    };

    const toggleMesero = () => {
        setShowMesero(!showMesero);
        setShowRegistros(false);
        setShowMenu(false);
    };

    const toggleReportes = () => {
        setShowReportes(!showReportes);
        setShowRegistros(false);
        setShowMenu(false);
    };



    return (
        <>
            <button
                className="sidebar-toggle-btn d-md-none"
                onClick={toggleSidebar}
            >
                <i className="bi bi-list"></i>
            </button>

            {isOpen && (
                <div className="sidebar-overlay d-md-none" onClick={closeSidebar}></div>
            )}

            <div
                className={`sidebar-container ${isOpen ? 'open' : ''} vh-100 p-3 d-flex flex-column d-md-block`}
            >
                <h4 className="text-white">MiraLago</h4>
                <ul className="nav flex-column">
                    <li className="nav-item mb-2">
                        <Link to="/home" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                            <i className="bi bi-house-door-fill me-2"></i>
                            <span>Home</span>
                        </Link>
                    </li>
                    

                   {/* Modulo Usuarios*/}
                   <li className="nav-item mb-2">
                        <button
                            className="btn btn-link nav-link text-white d-flex align-items-center"
                            onClick={toggleRegistros}
                        >
                            <i className="bi bi-person-rolodex me-2"></i>
                            <span className="me-3">Usuarios</span>
                            <i className={`bi ms-auto ${showRegistros ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                        </button>

                        {showRegistros && (
                            <ul className="nav flex-column ms-3">
                                <li className="nav-item mb-2">
                                    <Link to="/usuario" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                                        <i className="bi bi-person-fill me-2"></i>
                                        <span>Usuario</span>
                                    </Link>
                                </li>
                                <li className="nav-item mb-2">
                                    <Link to="/empleado" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                                        <i className="bi bi-person-badge-fill me-2"></i>
                                        <span>Empleado</span>
                                    </Link>
                                </li>
                                <li className="nav-item mb-2">
                                    <Link to="/reporteuser" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                                        <i className="bi bi-person-lines-fill me-2"></i>
                                        <span>Reporte Usuarios</span>
                                    </Link>
                                </li>
                                <li className="nav-item mb-2">
                                    <Link to="/reporteempleado" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                                        <i className="bi bi-person-video2 me-2"></i>
                                        <span>Reporte Empleados</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* Modulo Clientes*/}
                    <li className="nav-item mb-2">
                        <button
                            className="btn btn-link nav-link text-white d-flex align-items-center"
                            onClick={toggleClientes}
                        >
                            <i className='bx bxs-user-detail'></i>
                            <span className="me-3">Clientes</span>
                            <i className={`bi ms-auto ${showClientes ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                        </button>

                        {showClientes && (
                            <ul className="nav flex-column ms-3">
                                <li className="nav-item mb-2">
                                    <Link to="/clientes" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                                        <i className="bi bi-person-fill me-2"></i>
                                        <span>Clientes</span>
                                    </Link>
                                </li>
                                <li className="nav-item mb-2">
                                    <Link to="/reporteclientes" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                                        <i className="bi bi-person-badge-fill me-2"></i>
                                        <span>Reporte Clientes</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* Modulo Menu */}
                    <li className="nav-item mb-2">
                        <button
                            className="btn btn-link nav-link text-white d-flex align-items-center"
                            onClick={toggleMenu}
                        >
                            <i className='bx bxs-food-menu'></i>
                            <span className="me-3">Menu</span>
                            <i className={`bi ms-auto ${showMenu ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                        </button>

                        {showMenu && (
                            <ul className="nav flex-column ms-3">
                                <li className="nav-item mb-2">
                                    <Link to="/categoriaplato" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                                        <i className="bi bi-menu-button-fill me-2"></i>
                                        <span>Categoria Platillo</span>
                                    </Link>
                                </li>
                                <li className="nav-item mb-2">
                                    <Link to="/plato" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                                        <i className="bi bi-egg-fried me-2"></i>
                                        <span>Platillo</span>
                                    </Link>
                                </li>
                                <li className="nav-item mb-2">
                                    <Link to="/mesa" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                                        <i className="bi bi-align-top me-2"></i>
                                        <span>Mesa</span>
                                    </Link>
                                </li>
                                {/* <li className="nav-item mb-2">
                                    <Link to="/orden" className="nav-link text-white d-flex align-items-center">
                                        <i className="bi bi-receipt me-2"></i>
                                        <span>Orden</span>
                                    </Link>
                                </li>
                                <li className="nav-item mb-2">
                                    <Link to="/detalleorden" className="nav-link text-white d-flex align-items-center">
                                        <i className="bi bi-receipt-cutoff me-2"></i>
                                        <span>Detalle Orden</span>
                                    </Link>
                                </li> */}
                                <li className="nav-item mb-2">
                                    <Link to="/reporteplato" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                                        <i className="bi bi-card-heading me-2"></i>
                                        <span>Reporte Platillo</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                    {/* Modulo Mesero */}
                    <li className="nav-item mb-2">
                        <button
                            className="btn btn-link nav-link text-white d-flex align-items-center"
                            onClick={toggleMesero}
                        >
                            <i className="bx bxs-dish"></i>
                            <span className="me-3">Mesero</span>
                            <i className={`bi ms-auto ${showMesero ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                        </button>

                        {showMesero && (
                            <ul className="nav flex-column ms-3">
                                <li className="nav-item mb-2">
                                    <Link to="/frontmesero" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                                        <i className='bx bx-edit'></i>
                                        <span>Tomar Orden</span>
                                    </Link>
                                </li>
                                <li className="nav-item mb-2">
                                    <Link to="/ordeneslistas" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                                        <i className='bx bx-list-check'></i>
                                        <span>Ordenes Listas</span>
                                    </Link>
                                </li>
                                <li className="nav-item mb-2">
                                    <Link to="/Factura" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                                        <i className="bi bi-archive me-2"></i>
                                        <span>Generar factura</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                        </li>
                    {/* Modulo Cocina */}
                    <li className="nav-item mb-2">
                        <button
                            className="btn btn-link nav-link text-white d-flex align-items-center"
                            onClick={toggleCocina}
                        >
                            <i className="bi bi-basket me-2"></i>
                            <span className="me-3">Cocina</span>
                            <i className={`bi ms-auto ${showCocina ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                        </button>

                        {showCocina && (
                            <ul className="nav flex-column ms-3">
                                <li className="nav-item mb-2">
                                    <Link to="/Cocina" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                                        <i className="bi bi-hourglass-split me-2"></i>
                                        <span>Órdenes Activas</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                    {/* Modulo Reportes */}
                    <li className="nav-item mb-2">
                        <button
                            className="btn btn-link nav-link text-white d-flex align-items-center"
                            onClick={toggleReportes}
                        >
                        <i className='bx bxs-report'></i>
                            <span className="me-3">Reportes</span>
                            <i className={`bi ms-auto ${showReportes ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                        </button>

                        {showReportes && (
                            <ul className="nav flex-column ms-3">
                                <li className="nav-item mb-2">
                                    <Link to="/ventasdiarias" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                                        <i className='bi bi-file-earmark-bar-graph-fill'></i>
                                        <span>Ventas Diarias</span>
                                    </Link>
                                </li>
                                <li className="nav-item mb-2">
                                    <Link to="/repventasplatillo " className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                                        <i className='bi bi-file-earmark-bar-graph-fill'></i>
                                        <span>Ventas por Platillos</span>
                                    </Link>
                                </li>
                                <li className="nav-item mb-2">
                                    <Link to="/repventasmesa" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}> 
                                        <i className='bi bi-file-earmark-bar-graph-fill'></i>
                                        <span>Ventas por Mesa</span>
                                    </Link>
                                </li>
                                <li className="nav-item mb-2">
                                    <Link to="/repventasmes" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                                        <i className='bi bi-file-earmark-bar-graph-fill'></i>
                                        <span>Ventas por Mes</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                        </li>
                    <li className="nav-item mb-2">
                        <Link to="/caja" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                        <i className='bx bx-money-withdraw'></i>
                            <span>Cuadre de Caja</span>
                        </Link>
                    </li>
                    <li className="nav-item mb-2">
                        <Link to="/Logout" className="nav-link text-white d-flex align-items-center" onClick={closeSidebar}>
                            <i className="bi bi-box-arrow-left me-2"></i>
                            <span>Logout</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default Sidebar;