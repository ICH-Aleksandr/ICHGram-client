import { useEffect, useState } from "react";
import api from "../../api/axios";
import PostCard from "../../components/PostCard";
import styles from "./styles.module.css";

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsRes = await api.get("/posts");

        const postsWithLikes = await Promise.all(
          postsRes.data.map(async (post) => {
            try {
              const [likesRes, commentsRes] = await Promise.all([
                api.get(`/likes/${post._id}`),
                api.get(`/comments/${post._id}`),
              ]);
              return {
                ...post,
                likesCount: likesRes.data.count,
                comments: commentsRes.data,
              };
            } catch {
              return { ...post, likesCount: 0, comments: [] };
            }
          }),
        );

        setPosts(postsWithLikes);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {posts.length > 0 && (
        <div className={styles.allSeen}>
          <div className={styles.allSeenIcon}>✓</div>
          <p className={styles.allSeenTitle}>You've seen all the updates</p>
          <p className={styles.allSeenSub}>
            You have viewed all new publications.
          </p>
        </div>
      )}

      {posts.length === 0 && (
        <div className={styles.empty}>No posts yet</div>
      )}
    </div>
  );
}

export default Home;
