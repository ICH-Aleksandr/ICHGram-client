import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import styles from "./styles.module.css";

function PostModal({
  post,
  comments,
  likesCount,
  liked,
  onLikeToggle,
  onCommentAdded,
  onClose,
}) {
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [now] = useState(() => Date.now());

  const formatTime = (dateStr) => {
    const diff = Math.floor((now - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const handleGoToProfile = (userId) => {
    onClose();
    navigate(`/profile/${userId}`);
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || posting) return;
    try {
      setPosting(true);
      const response = await api.post(`/comments/${post._id}`, {
        text: commentText,
      });
      onCommentAdded(response.data);
      setCommentText("");
    } catch (error) {
      console.error("Comment error:", error);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        <div className={styles.imageArea}>
          {post.image && (
            <img src={post.image} alt="post" className={styles.image} />
          )}
        </div>

        <div className={styles.aside}>
          <div className={styles.header}>
            <div
              className={styles.authorInfo}
              onClick={() => handleGoToProfile(post.author._id)}
            >
              <div className={styles.avatar}>
                {post.author.profile_image ? (
                  <img
                    src={post.author.profile_image}
                    alt={post.author.username}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {post.author.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <span className={styles.username}>{post.author.username}</span>
            </div>
          </div>

          <div className={styles.commentsList}>
            {post.description && (
              <div className={styles.commentRow}>
                <div className={styles.avatar}>
                  {post.author.profile_image ? (
                    <img
                      src={post.author.profile_image}
                      alt={post.author.username}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {post.author.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={styles.commentBody}>
                  <span className={styles.commentAuthor}>
                    {post.author.username}
                  </span>{" "}
                  {post.description}
                </div>
              </div>
            )}

            {comments.map((comment) => (
              <div key={comment._id} className={styles.commentRow}>
                <div className={styles.avatar}>
                  {comment.author.profile_image ? (
                    <img
                      src={comment.author.profile_image}
                      alt={comment.author.username}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {comment.author.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={styles.commentBody}>
                  <span className={styles.commentAuthor}>
                    {comment.author.username}
                  </span>{" "}
                  {comment.text}
                </div>
              </div>
            ))}

            {comments.length === 0 && !post.description && (
              <div className={styles.noComments}>No comments yet</div>
            )}
          </div>

          <div className={styles.footer}>
            <div className={styles.actions}>
              <button
                className={`${styles.actionBtn} ${liked ? styles.liked : ""}`}
                onClick={onLikeToggle}
              >
                {liked ? "♥" : "♡"}
              </button>
              <button className={styles.actionBtn}>💬</button>
            </div>

            <div className={styles.likes}>{likesCount} likes</div>
            <div className={styles.time}>{formatTime(post.createdAt)} ago</div>

            <div className={styles.commentInput}>
              <input
                type="text"
                placeholder="Add comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim() || posting}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostModal;
