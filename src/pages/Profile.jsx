import { useState } from 'react';
import { Camera } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(user?.profile_picture || null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = { ...formData };
      if (profilePicture) {
        data.profile_picture = profilePicture;
      }

      const response = await authAPI.updateProfile(data);
      updateUser(response.data);
      setEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {user?.username[0].toUpperCase()}
                </div>
              )}
              {editing && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700">
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {!editing && (
              <div className="text-center mt-4">
                <h2 className="text-2xl font-bold text-gray-900">{user?.username}</h2>
                <p className="text-gray-600">{user?.email}</p>
                {(user?.first_name || user?.last_name) && (
                  <p className="text-gray-700 mt-2">
                    {user.first_name} {user.last_name}
                  </p>
                )}
              </div>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Usuário</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="input-field mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Sobrenome</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="input-field mt-1"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      username: user?.username || '',
                      email: user?.email || '',
                      first_name: user?.first_name || '',
                      last_name: user?.last_name || '',
                    });
                    setPreview(user?.profile_picture || null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setEditing(true)} className="w-full btn-primary">
              Editar Perfil
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;