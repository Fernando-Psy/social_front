import { useState, useRef } from 'react';
import { Image, Send } from 'lucide-react';
import { postsAPI } from '../../services/api';

const PostForm = ({ onPostCreated }) => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !image) {
            setError('Escreva algo ou adicione uma imagem');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Criar objeto com content e image
            const postData = {
                content: content.trim(),
                image: image
            };

            await postsAPI.create(postData);

            setContent('');
            clearImage();
            if (onPostCreated) onPostCreated();
        } catch (err) {
            console.error(err);
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
                        <button
                            type="button"
                            onClick={clearImage}
                            aria-label="Remover imagem"
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                        >
                            ×
                        </button>
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
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
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