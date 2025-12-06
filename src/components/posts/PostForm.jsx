import { useState } from 'react';
import { Send, X } from 'lucide-react';
import { postsAPI } from '../../services/api';
import ImageUpload from '../common/ImageUpload';

const PostForm = ({ onPostCreated }) => {
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageUploaded = (url) => {
        setImageUrl(url);
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
            setImageUrl(null);

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

                <div className="mt-4">
                    <ImageUpload
                        onImageUploaded={handleImageUploaded}
                        currentImage={imageUrl}
                        folder="social_posts"
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                )}

                <div className="flex justify-end mt-4">
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