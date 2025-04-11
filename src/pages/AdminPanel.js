// AdminPanel.js
import React from 'react';
import { AllowedAccess } from 'react-permission-role';

const AdminPanel = () => {
    return (
        <AllowedAccess 
            roles={["admin"]} 
            permissions="manage-users" 
            renderAuthFailed={<p>No tienes permiso para ver esto.</p>}
            isLoading={<p>Cargando...</p>}
        >
            <h1>Panel de Administración</h1>
            {/* Contenido exclusivo para administradores */}
        </AllowedAccess>
    );
};

export default AdminPanel;