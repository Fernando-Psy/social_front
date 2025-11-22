import { useState } from 'react';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import { postsAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const isLiked = likes.some(like => like.user.id === user.id);
  const isOwner = post.user.id === user.id;

  const handleLike = async () => {
    try {
      if (isLiked) {
        await postsAPI.unlike(post.id);
        setLikes(likes.filter(like => like.user.id !== user.id));
      } else {
        await postsAPI.like(post.id);
        setLikes([...likes, { user }]);
      }
    } catch (error) {
      console.error('Erro ao curtir:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await postsAPI.comment(post.id, newComment);
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Erro ao comentar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este post?')) {
      try {
        await postsAPI.delete(post.id);
        if (onDelete) onDelete(post.id);
      } catch (error) {
        console.error('Erro ao excluir:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="card mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {post.user.username[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{post.user.username}</h3>
            <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="w-full rounded-lg mb-4 max-h-96 object-cover"
        />
      )}

      <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm">{likes.length}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">{comments.length}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva um comentário..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                Enviar
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-sm">{comment.user.username}</span>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;