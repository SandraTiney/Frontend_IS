import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../style/Error404.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';

const Error404 = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleRedirect = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="error-404-container" onClick={handleRedirect}>
      <div className="error-content">
        <FontAwesomeIcon icon={faUtensils} className="fork-icon" />
        <h1 className="error-title">404</h1>
        <p className="error-message">Oops! La página que buscas no existe.</p>
        <button className="redirect-button" onClick={handleRedirect}>
          {user ? 'Volver al Home' : 'Regresar...'}
        </button>
      </div>
    </div>
  );
};

export default Error404;
