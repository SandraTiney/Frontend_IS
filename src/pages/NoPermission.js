import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import '../style/NoPermission.css';

const NoPermission = () => {
  return (
    <div className="no-permission-container">
      <div className="permission-content">
        <FontAwesomeIcon icon={faLock} className="lock-icon" />
        <h1 className="permission-title">Acceso Restringido</h1>
        <p className="permission-message">
          Lo sentimos, no tienes permiso para ver este contenido.
        </p>
      </div>
    </div>
  );
};

export default NoPermission;