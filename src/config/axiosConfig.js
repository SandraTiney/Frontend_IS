import axios from 'axios';

// Add a request interceptor
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response.status === 401) {
            // Redirect to login page or refresh token
            localStorage.removeItem('token');
            // You might want to redirect to login page here
        }
        return Promise.reject(error);
    }
);