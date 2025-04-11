// Login.js
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermission } from 'react-permission-role';
import '../style/Login.css'; 
import imgLogo from '../asset/img/miralago.jpg'; 
import imgFood from '../asset/img/food-image.jpg'; 

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
    const { setUser } = usePermission(); 

    function handleSubmit(event) {
        event.preventDefault();
        axios.post('http://localhost:3001/login', { username, password })
            .then(res => {
                if (res.status === 200 && res.data.token) {
                    localStorage.setItem('token', res.data.token);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                    login(res.data.user);
                    setUser({
                        id: res.data.user.id,
                        roles: res.data.user.roles || [],
                        permissions: res.data.user.permissions || []
                    });
                    console.log("Roles:", res.data.user.roles);
                    
                    console.log("Permissions:", res.data.user.permissions);

                    console.log('Navigating to /home');
                    navigate('/home');
                } else {
                    setError('Usuario o contraseña incorrectos');
                }
            })
            .catch(err => {
                setError('Error al iniciar sesión, por favor intenta de nuevo');
            });
    }

    return (
        <div className="login-container">
            <div className="login-content">
                <div className="image-side">
                    <img src={imgFood} alt="Comida" className="food-image" />
                </div>
                <div className="login-box">
                    <div className="login-header">
                        <img src={imgLogo} alt="Logo" className="login-logo" />
                        <h2 className="login-title">MIRALAGO</h2>
                        <p className="login-welcome">
                            Hoy es un nuevo día. Es tu día. Tú le das sabor.
                            Inicia sesión para comenzar a gestionar tu restaurante.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username" className="form-label">Correo</label>
                            <input
                                type="text"
                                placeholder="ejemplo@correo.com"
                                className="form-control input-custom"
                                onChange={e => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <input
                                type="password"
                                placeholder="Minimo 8 caracteres"
                                className="form-control input-custom"
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-login">Iniciar Sesión</button>
                    </form>
                    {error && <div className="alert alert-danger mt-3">{error}</div>}
                    <label className="inicio">Al iniciar sesión aceptas nuestros términos y condiciones</label>
                </div>
            </div>
        </div>
    );
}

export default Login;
