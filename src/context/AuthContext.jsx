import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            if (typeof window === 'undefined') return null;
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(false);

    const login = async (username, password) => {
        setLoading(true);
        try {
            const response = await authAPI.login({ username, password });
            const data = response.data || {};

            console.log('Login response:', data);

            const access = data.access ?? data.access_token;
            const refresh = data.refresh ?? data.refresh_token;
            const userData = data.user ?? data.userData ?? data;

            if (access) {
                localStorage.setItem('access_token', access);
            }
            if (refresh) {
                localStorage.setItem('refresh_token', refresh);
            }
            if (userData) {
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
            }

            return { success: true };
        } catch (error) {
            console.error('Login error:', error.response?.data || error); // Debug

            // Trata diferentes formatos de erro
            let errorMessage = 'Erro ao fazer login';

            if (error.response?.data) {
                const data = error.response.data;
                if (typeof data === 'string') {
                    errorMessage = data;
                } else if (data.error) {
                    errorMessage = data.error;
                } else if (data.detail) {
                    errorMessage = data.detail;
                } else if (data.non_field_errors) {
                    errorMessage = Array.isArray(data.non_field_errors)
                        ? data.non_field_errors[0]
                        : data.non_field_errors;
                }
            }

            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    };

    const register = async (data) => {
        setLoading(true);
        try {
            const response = await authAPI.register(data);
            const responseData = response.data || {};

            console.log('Register response:', responseData); // Debug

            // Se o registro retornar tokens, faz login automático
            const access = responseData.access ?? responseData.access_token;
            const refresh = responseData.refresh ?? responseData.refresh_token;
            const userData = responseData.user ?? responseData.userData;

            if (access && refresh && userData) {
                localStorage.setItem('access_token', access);
                localStorage.setItem('refresh_token', refresh);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
            }

            return { success: true };
        } catch (error) {
            console.error('Register error:', error.response?.data || error); // Debug

            // Trata diferentes formatos de erro
            let errorData = 'Erro ao registrar';

            if (error.response?.data) {
                const data = error.response.data;

                // Se for um objeto com erros de campo
                if (typeof data === 'object' && !data.error && !data.detail) {
                    // Retorna o objeto completo de erros
                    errorData = data;
                } else if (typeof data === 'string') {
                    errorData = data;
                } else if (data.error) {
                    errorData = data.error;
                } else if (data.detail) {
                    errorData = data.detail;
                } else if (data.non_field_errors) {
                    errorData = Array.isArray(data.non_field_errors)
                        ? data.non_field_errors[0]
                        : data.non_field_errors;
                }
            }

            return {
                success: false,
                error: errorData
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
        try {
            localStorage.setItem('user', JSON.stringify(userData));
        } catch {
            // ignore storage errors
        }
    };

    // sincroniza estado entre abas
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'user') {
                try {
                    setUser(e.newValue ? JSON.parse(e.newValue) : null);
                } catch {
                    setUser(null);
                }
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};