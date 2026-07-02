import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import styles from "./styles.module.css";

function PostCard({ post, onLikeToggle }) {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);

  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [liked, setLiked] = useState(post.likedByMe || false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);

  const handleLike = async () => {
    try {
      await api.post(`/likes/${post._id}`);
      if (liked) {
        setLikesCount((prev) => prev - 1);
      } else {
        setLikesCount((prev) => prev + 1);
      }
      setLiked((prev) => !prev);
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const response = await api.post(`/comments/${post._id}`, {
        text: commentText,
      });
      setComments((prev) => [...prev, response.data]);
      setCommentText("");
    } catch (error) {
      console.error("Comment error:", error);
    }
  };

  const formatTime = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div
          className={styles.authorInfo}
          onClick={() => navigate(`/profile/${post.author._id}`)}
        >
          <div className={styles.avatar}>
            {post.author.profile_image ? (
              <img src={post.author.profile_image} alt={post.author.username} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {post.author.username[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <span className={styles.username}>{post.author.username}</span>
            <span className={styles.time}>{formatTime(post.createdAt)}</span>
          </div>
        </div>

        {currentUser?.id !== post.author._id && (
          <button className={styles.followBtn}>Follow</button>
        )}
      </div>

      <div className={styles.imageWrapper}>
        {post.image && (
          <img src={post.image} alt="post" className={styles.image} />
        )}
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.actionBtn} ${liked ? styles.liked : ""}`}
          onClick={handleLike}
        >
          {liked ? "♥" : "♡"}
        </button>
        <button
          className={styles.actionBtn}
          onClick={() => setShowCommentInput((prev) => !prev)}
        >
          💬
        </button>
      </div>

      <div className={styles.likes}>{likesCount} likes</div>

      {post.description && (
        <div className={styles.description}>
          <span className={styles.descUsername}>{post.author.username}</span>{" "}
          {post.description}
        </div>
      )}

      {comments.length > 0 && (
        <div className={styles.comments}>
          {comments.slice(0, 2).map((comment) => (
            <div key={comment._id} className={styles.comment}>
              <span className={styles.commentAuthor}>
                {comment.author.username}
              </span>{" "}
              {comment.text}
            </div>
          ))}
          {comments.length > 2 && (
            <span className={styles.viewAll}>
              View all comments ({comments.length})
            </span>
          )}
        </div>
      )}

      {showCommentInput && (
        <div className={styles.commentInput}>
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
          />
          <button onClick={handleAddComment}>Post</button>
        </div>
      )}
    </div>
  );
}

export default PostCard;
