import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import Swal from 'sweetalert2'; 
import '../style/Logout.css'; 

function Logout() {
    const { logout } = useAuth(); 
    const navigate = useNavigate();

    useEffect(() => {
        const confirmLogout = async () => {
            const result = await Swal.fire({
                title: '¿Estás seguro de que quieres salir?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ff9800', 
                cancelButtonColor: '#ff5722', 
                confirmButtonText: 'Sí, salir',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                logout(); 
                localStorage.removeItem('token');
                navigate('/'); 
            } else {
                navigate(-1); 
            }
        };

        confirmLogout(); 
    }, [logout, navigate]);

    return (
        <div className="logout-container">
            <div className="logout-message">
                Cierra sesión para continuar.
            </div>
        </div>
    ); 
}

export default Logout;