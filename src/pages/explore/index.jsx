import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import PostModal from "../../components/PostModal";
import styles from "./styles.module.css";

function Explore() {
  const currentUser = useSelector((state) => state.auth.user);

  const [posts, setPosts] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchExplore = async () => {
      try {
        setLoading(true);

        let followingIdsSet = new Set();
        if (currentUser?.id) {
          try {
            const followingRes = await api.get(
              `/follow/${currentUser.id}/following`,
            );
            followingIdsSet = new Set(
              followingRes.data.following.map((f) => f.following_id._id),
            );
          } catch {
            followingIdsSet = new Set();
          }
        }
        setFollowingIds(followingIdsSet);

        const postsRes = await api.get("/posts");
        setPosts(postsRes.data);
      } catch (error) {
        console.error("Explore fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExplore();
  }, [currentUser?.id]);

  const openPostModal = async (post) => {
    try {
      const [likesRes, commentsRes] = await Promise.all([
        api.get(`/likes/${post._id}`),
        api.get(`/comments/${post._id}`),
      ]);
      setSelectedPost({
        ...post,
        likesCount: likesRes.data.count,
        likedByMe: likesRes.data.likes.some(
          (like) => like.user._id === currentUser?.id,
        ),
        comments: commentsRes.data,
      });
    } catch (error) {
      console.error("Post fetch error:", error);
      setSelectedPost({ ...post, likesCount: 0, likedByMe: false, comments: [] });
    }
  };

  const handleModalLike = async () => {
    if (!selectedPost) return;
    try {
      await api.post(`/likes/${selectedPost._id}`);
      setSelectedPost((prev) => ({
        ...prev,
        likedByMe: !prev.likedByMe,
        likesCount: prev.likedByMe ? prev.likesCount - 1 : prev.likesCount + 1,
      }));
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleModalCommentAdded = (comment) => {
    setSelectedPost((prev) => ({
      ...prev,
      comments: [...prev.comments, comment],
    }));
  };

  const handleModalFollowChange = (authorId, nextIsFollowing) => {
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (nextIsFollowing) {
        next.add(authorId);
      } else {
        next.delete(authorId);
      }
      return next;
    });
  };

  const handleModalPostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    setSelectedPost(null);
  };

  const handleModalPostUpdated = (postId, updatedFields) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, ...updatedFields } : p)),
    );
    setSelectedPost((prev) =>
      prev && prev._id === postId ? { ...prev, ...updatedFields } : prev,
    );
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.postsGrid}>
        {posts.map((post) => (
          <div
            key={post._id}
            className={styles.postThumb}
            onClick={() => openPostModal(post)}
          >
            <img src={post.image} alt="post" />
          </div>
        ))}
      </div>

      {posts.length === 0 && <div className={styles.empty}>No posts yet</div>}

      {selectedPost && (
        <PostModal
          post={selectedPost}
          comments={selectedPost.comments}
          likesCount={selectedPost.likesCount}
          liked={selectedPost.likedByMe}
          onLikeToggle={handleModalLike}
          onCommentAdded={handleModalCommentAdded}
          onClose={() => setSelectedPost(null)}
          isFollowing={followingIds.has(selectedPost.author._id)}
          onFollowChange={handleModalFollowChange}
          onPostDeleted={handleModalPostDeleted}
          onPostUpdated={handleModalPostUpdated}
        />
      )}
    </div>
  );
}

export default Explore;
