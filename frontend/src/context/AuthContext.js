import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateSession = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.validateToken();
                    setUser(response.data);
                } catch (error) {
                    // If token validation fails, try to refresh
                    try {
                        const refreshResponse = await api.refreshToken();
                        localStorage.setItem('token', refreshResponse.data.access);
                        const userResponse = await api.validateToken();
                        setUser(userResponse.data);
                    } catch (refreshError) {
                        // If refresh fails, clear everything
                        logout();
                    }
                }
            }
            setLoading(false);
        };
        
        validateSession();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await api.login(credentials);
            const { access, refresh, user: userData } = response.data;
            localStorage.setItem('token', access);
            localStorage.setItem('refreshToken', refresh);
            setUser(userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    const register = async (userData) => {
        try {
            const response = await api.register(userData);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                // Handle structured error response from Django
                const errorData = error.response.data;
                let errorMessage = '';
                
                if (typeof errorData === 'object') {
                    // Combine all error messages
                    errorMessage = Object.entries(errorData)
                        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
                        .join('\n');
                } else {
                    errorMessage = errorData;
                }
                
                throw new Error(errorMessage);
            } else {
                throw new Error('Registration failed. Please try again.');
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
