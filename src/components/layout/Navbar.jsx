import { Link, useNavigate } from 'react-router-dom';
import { Home, Users, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // Se logout for síncrono, await não causa problema; se for assíncrono, aguardamos a conclusão
            await logout();
            navigate('/login');
        } catch (err) {
            // Lide com erro conforme necessário (toast, console, etc.)
            console.error('Logout failed', err);
        }
    };

    return (
        <nav className="bg-white shadow-md" aria-label="Main navigation">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2" aria-label="Home">
                        <Users className="w-8 h-8 text-blue-600" aria-hidden="true" />
                        <span className="text-xl font-bold text-gray-900">Social App</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        <Link
                            to="/"
                            className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                            aria-label="Feed"
                        >
                            <Home className="w-5 h-5" aria-hidden="true" />
                            <span className="hidden sm:inline">Feed</span>
                        </Link>

                        <Link
                            to="/followers"
                            className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                            aria-label="Conexões"
                        >
                            <Users className="w-5 h-5" aria-hidden="true" />
                            <span className="hidden sm:inline">Conexões</span>
                        </Link>

                        <Link
                            to="/profile"
                            className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                            aria-label="Perfil"
                        >
                            <User className="w-5 h-5" aria-hidden="true" />
                            <span className="hidden sm:inline">Perfil</span>
                        </Link>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                            aria-label="Sair"
                        >
                            <LogOut className="w-5 h-5" aria-hidden="true" />
                            <span className="hidden sm:inline">Sair</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;