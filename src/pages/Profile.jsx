import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.bio || '',
  });
  const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profile_picture || null);
  const [preview, setPreview] = useState(user?.profile_picture || null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Credenciais do Cloudinary
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'profile_pictures');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Falha no upload para Cloudinary');
    }

    return await response.json();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validações
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Preview local imediato
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);

      // Upload para Cloudinary
      const data = await uploadToCloudinary(file);
      const cloudinaryUrl = data.secure_url;

      console.log('✅ Upload concluído:', cloudinaryUrl);

      // Salvar URL do Cloudinary
      setProfilePictureUrl(cloudinaryUrl);
      setPreview(cloudinaryUrl);

    } catch (err) {
      console.error('❌ Erro no upload:', err);
      setError('Erro ao fazer upload da imagem');
      setPreview(user?.profile_picture || null);
      setProfilePictureUrl(user?.profile_picture || null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Criar objeto JSON com os dados
      const dataToSend = {
        ...formData,
        profile_picture: profilePictureUrl // URL do Cloudinary
      };

      console.log('Enviando dados:', dataToSend);

      const response = await authAPI.updateProfile(dataToSend);

      console.log('Resposta:', response.data);

      const updatedUser = response.data.user || response.data;
      updateUser(updatedUser);

      setEditing(false);
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
    setProfilePictureUrl(user?.profile_picture || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

              {/* Botão de câmera aparece SEMPRE em modo de edição */}
              {editing && (
                <>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>

                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="animate-spin text-white mx-auto" size={24} />
                      </div>
                    </div>
                  )}
                </>
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
                  disabled={loading || uploading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading || uploading}
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