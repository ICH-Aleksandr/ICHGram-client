import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import PostCard from "../../components/PostCard";
import updateIndicator from "../../assets/images/UpdateIndicator.png";
import styles from "./styles.module.css";

function Home() {
  const currentUser = useSelector((state) => state.auth.user);
  const [posts, setPosts] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsRes = await api.get("/posts");

        let initialFollowingIds = new Set();
        if (currentUser?.id) {
          try {
            const followingRes = await api.get(
              `/follow/${currentUser.id}/following`,
            );
            initialFollowingIds = new Set(
              followingRes.data.following.map((f) => f.following_id._id),
            );
          } catch {
            initialFollowingIds = new Set();
          }
        }
        setFollowingIds(initialFollowingIds);

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
                likedByMe: likesRes.data.likes.some(
                  (like) => like.user._id === currentUser?.id,
                ),
                comments: commentsRes.data,
              };
            } catch {
              return {
                ...post,
                likesCount: 0,
                likedByMe: false,
                comments: [],
              };
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
  }, [currentUser?.id]);

  const handleFollowChange = (authorId, isFollowing) => {
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (isFollowing) {
        next.add(authorId);
      } else {
        next.delete(authorId);
      }
      return next;
    });
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            isFollowing={followingIds.has(post.author._id)}
            onFollowChange={handleFollowChange}
            onPostDeleted={handlePostDeleted}
          />
        ))}
      </div>

      {posts.length > 0 && (
        <div className={styles.allSeen}>
          <img
            src={updateIndicator}
            alt="You've seen all the updates"
            className={styles.allSeenIcon}
          />
          <p className={styles.allSeenTitle}>You've seen all the updates</p>
          <p className={styles.allSeenSub}>
            You have viewed all new publications
          </p>
        </div>
      )}

      {posts.length === 0 && <div className={styles.empty}>No posts yet</div>}
    </div>
  );
}

export default Home;
