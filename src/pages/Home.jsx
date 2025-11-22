import { useState } from 'react';
import Layout from '../components/layout/Layout';
import PostForm from '../components/posts/PostForm';
import PostList from '../components/posts/PostList';

const Home = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Feed</h1>
        <PostForm onPostCreated={handlePostCreated} />
        <PostList refresh={refreshKey} />
      </div>
    </Layout>
  );
};

export default Home;