import { useState, useRef } from 'react';
import { Image, Send, X, Loader2 } from 'lucide-react';
import { postsAPI } from '../../services/api';

const PostForm = ({ onPostCreated }) => {
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    // Credenciais do Cloudinary
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', 'social_posts');

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
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);

            // Upload para Cloudinary
            const data = await uploadToCloudinary(file);
            const cloudinaryUrl = data.secure_url;

            console.log('✅ Upload concluído:', cloudinaryUrl);

            // Salvar URL do Cloudinary
            setImageUrl(cloudinaryUrl);
            setImagePreview(cloudinaryUrl);

        } catch (err) {
            console.error('❌ Erro no upload:', err);
            setError('Erro ao fazer upload da imagem');
            setImagePreview(null);
            setImageUrl(null);
        } finally {
            setUploading(false);
        }
    };

    const clearImage = () => {
        setImageUrl(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !imageUrl) {
            setError('Escreva algo ou adicione uma imagem');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Enviar URL da imagem em vez do arquivo
            const postData = {
                content: content.trim(),
                image: imageUrl // URL do Cloudinary
            };

            console.log('Enviando post:', postData);

            await postsAPI.create(postData);

            // Limpar formulário
            setContent('');
            clearImage();

            if (onPostCreated) onPostCreated();
        } catch (err) {
            console.error('Erro ao criar post:', err);
            setError('Erro ao criar post. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card mb-6">
            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="No que você está pensando?"
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows="3"
                    style={{
                        color: '#000',
                        backgroundColor: '#fff',
                    }}
                />

                {imagePreview && (
                    <div className="mt-3 relative">
                        <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg" />
                        {!uploading && (
                            <button
                                type="button"
                                onClick={clearImage}
                                aria-label="Remover imagem"
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                            >
                                <X className="w-4 h-4" />
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
                )}

                {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                )}

                <div className="flex justify-between items-center mt-4">
                    <label className="cursor-pointer flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                        <Image className="w-5 h-5" />
                        <span className="text-sm">Adicionar foto</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                        <span>{loading ? 'Publicando...' : 'Publicar'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostForm;