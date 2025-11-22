import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import PostCard from './PostCard';
import { postsAPI } from '../../services/api';

const PostList = ({ refresh }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await postsAPI.getAll();
      setPosts(response.data);
    } catch (err) {
      setError('Erro ao carregar posts. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [refresh]);

  const handleDelete = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 border border-red-200">
        <p className="text-red-700">{error}</p>
        <button onClick={fetchPosts} className="btn-primary mt-4">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 text-lg">
          Nenhum post ainda. Comece seguindo pessoas ou crie seu primeiro post!
        </p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDelete={handleDelete} />
      ))}
    </div>
  );
};

export default PostList;