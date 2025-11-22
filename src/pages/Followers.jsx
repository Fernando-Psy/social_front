import { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { followsAPI } from '../services/api';

const Followers = () => {
  const [activeTab, setActiveTab] = useState('followers');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [followersRes, followingRes] = await Promise.all([
        followsAPI.getFollowers(),
        followsAPI.getFollowing(),
      ]);
      setFollowers(followersRes.data);
      setFollowing(followingRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await followsAPI.follow(userId);
      fetchData();
    } catch (error) {
      console.error('Erro ao seguir:', error);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await followsAPI.unfollow(userId);
      fetchData();
    } catch (error) {
      console.error('Erro ao deixar de seguir:', error);
    }
  };

  const isFollowing = (userId) => {
    return following.some(user => user.id === userId);
  };

  const UserCard = ({ user, showFollowButton = false }) => (
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
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
      </div>

      {showFollowButton && (
        <button
          onClick={() => isFollowing(user.id) ? handleUnfollow(user.id) : handleFollow(user.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isFollowing(user.id)
              ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isFollowing(user.id) ? (
            <>
              <UserMinus className="w-4 h-4" />
              <span>Deixar de seguir</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Seguir</span>
            </>
          )}
        </button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Conexões</h1>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('followers')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'followers'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Seguidores ({followers.length})
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'following'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Seguindo ({following.length})
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {activeTab === 'followers' ? (
                  followers.length > 0 ? (
                    followers.map((user) => (
                      <UserCard key={user.id} user={user} showFollowButton />
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      Você ainda não tem seguidores
                    </p>
                  )
                ) : (
                  following.length > 0 ? (
                    following.map((user) => (
                      <UserCard key={user.id} user={user} showFollowButton />
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      Você ainda não está seguindo ninguém
                    </p>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Followers;