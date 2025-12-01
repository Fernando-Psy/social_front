import { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Loader2, Search } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { followsAPI, usersAPI } from '../services/api';

const Discover = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [followingLoading, setFollowingLoading] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar lista de usuários que você já segue
      const followingRes = await followsAPI.getFollowing();
      setFollowing(followingRes.data);

      // Buscar todos os usuários
      const usersRes = await usersAPI.getAll();
      setAllUsers(usersRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    setFollowingLoading({ ...followingLoading, [userId]: true });
    try {
      await followsAPI.follow(userId);
      await fetchData();
    } catch (error) {
      console.error('Erro ao seguir:', error);
    } finally {
      setFollowingLoading({ ...followingLoading, [userId]: false });
    }
  };

  const handleUnfollow = async (userId) => {
    setFollowingLoading({ ...followingLoading, [userId]: true });
    try {
      await followsAPI.unfollow(userId);
      await fetchData();
    } catch (error) {
      console.error('Erro ao deixar de seguir:', error);
    } finally {
      setFollowingLoading({ ...followingLoading, [userId]: false });
    }
  };

  const isFollowing = (userId) => {
    return following.some(user => user.id === userId);
  };

  const filteredUsers = allUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const UserCard = ({ user }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        {user.profile_picture ? (
          <img
            src={user.profile_picture}
            alt={user.username}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user.username[0].toUpperCase()}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900">{user.username}</h3>
          {(user.first_name || user.last_name) && (
            <p className="text-sm text-gray-600">
              {user.first_name} {user.last_name}
            </p>
          )}
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </div>

      <button
        onClick={() => isFollowing(user.id) ? handleUnfollow(user.id) : handleFollow(user.id)}
        disabled={followingLoading[user.id]}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
          isFollowing(user.id)
            ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {followingLoading[user.id] ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isFollowing(user.id) ? (
          <>
            <UserMinus className="w-4 h-4" />
            <span>Seguindo</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            <span>Seguir</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Descobrir Pessoas</h1>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, usuário ou e-mail..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  {searchTerm
                    ? 'Nenhum usuário encontrado com esse critério'
                    : 'Nenhum usuário disponível'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Discover;