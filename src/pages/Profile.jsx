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
    bio: user?.bio || '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(user?.profile_picture || null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB');
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setError('O arquivo deve ser uma imagem');
        return;
      }

      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Criar FormData
      const formDataToSend = new FormData();

      // Adicionar campos que foram modificados
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== user?.[key]) {
          formDataToSend.append(key, formData[key] || '');
        }
      });

      // Adicionar imagem se houver
      if (profilePicture) {
        formDataToSend.append('profile_picture', profilePicture);
      }

      console.log('Enviando dados:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await authAPI.updateProfile(formDataToSend);

      console.log('Resposta:', response.data);

      // Atualizar contexto com novos dados
      const updatedUser = response.data.user || response.data;
      updateUser(updatedUser);

      // Atualizar preview com a URL da imagem do servidor
      if (updatedUser.profile_picture) {
        setPreview(updatedUser.profile_picture);
      }

      setEditing(false);
      setProfilePicture(null);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);

      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          setError(errorData);
        } else if (errorData.error) {
          setError(errorData.error);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => {
              const fieldName = {
                username: 'Usuário',
                email: 'E-mail',
                first_name: 'Nome',
                last_name: 'Sobrenome',
                profile_picture: 'Foto de perfil',
                bio: 'Bio'
              }[field] || field;

              const message = Array.isArray(messages) ? messages[0] : messages;
              return `${fieldName}: ${message}`;
            })
            .join('. ');

          setError(errorMessages || 'Erro ao atualizar perfil');
        }
      } else {
        setError('Erro ao atualizar perfil. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      bio: user?.bio || '',
    });
    setPreview(user?.profile_picture || null);
    setProfilePicture(null);
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
                {user?.bio && (
                  <p className="text-gray-600 mt-2 italic">{user.bio}</p>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900 resize-none"
                  placeholder="Conte um pouco sobre você..."
                />
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
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 btn-secondary disabled:opacity-50"
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