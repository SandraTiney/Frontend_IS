
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { PermissionProvider } from 'react-permission-role';
import './config/axiosConfig'

function App() {
  return (

      <AuthProvider>
        <PermissionProvider>
      <AppRoutes />
      </PermissionProvider>
      </AuthProvider>

  );
}

export default App;
