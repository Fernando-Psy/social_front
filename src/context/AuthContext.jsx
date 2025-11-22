import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

// Criar o contexto que estava faltando
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

            // aceitar ambas variantes de nomes de token
            const access = data.access ?? data.access_token;
            const refresh = data.refresh ?? data.refresh_token;
            const userData = data.user ?? data.userData ?? data;

            if (access) localStorage.setItem('access_token', access);
            if (refresh) localStorage.setItem('refresh_token', refresh);
            if (userData) localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData || null);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.response?.data || 'Erro ao fazer login'
            };
        } finally {
            setLoading(false);
        }
    };

    const register = async (data) => {
        setLoading(true);
        try {
            await authAPI.register(data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || 'Erro ao registrar'
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