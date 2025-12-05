import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

const ImageUpload = ({
  onImageUploaded,
  currentImage = null,
  className = '',
  folder = 'social_api'
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState('');

  // Pegar credenciais do .env
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

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

  const handleFileChange = async (e) => {
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

      // URL da imagem no Cloudinary
      const imageUrl = data.secure_url;

      console.log('✅ Upload concluído:', imageUrl);

      // Atualizar preview com URL do Cloudinary
      setPreview(imageUrl);

      // Callback com a URL
      if (onImageUploaded) {
        onImageUploaded(imageUrl);
      }

    } catch (err) {
      console.error('❌ Erro no upload:', err);
      setError('Erro ao fazer upload da imagem');
      setPreview(currentImage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (onImageUploaded) {
      onImageUploaded(null);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            {!uploading && (
              <button
                onClick={handleRemove}
                type="button"
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg"
                aria-label="Remover imagem"
              >
                <X size={16} />
              </button>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <Loader2 className="animate-spin text-white mx-auto" size={32} />
                  <p className="text-white text-sm mt-2">Fazendo upload...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Clique para fazer upload</span>
              </p>
              <p className="text-xs text-gray-500">PNG, JPG ou JPEG (máx. 5MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {uploading && !preview && (
        <p className="mt-2 text-sm text-blue-600 flex items-center">
          <Loader2 className="animate-spin mr-2" size={16} />
          Fazendo upload...
        </p>
      )}
    </div>
  );
};

export default ImageUpload;