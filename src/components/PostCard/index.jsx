import { useState, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import PostModal from "../PostModal";
import styles from "./styles.module.css";

function PostCard({ post, isFollowing, onFollowChange }) {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);

  const [now] = useState(() => Date.now());
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [liked, setLiked] = useState(post.likedByMe || false);
  const [comments, setComments] = useState(post.comments || []);
  const [showPostModal, setShowPostModal] = useState(false);
  const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);
  const descriptionRef = useRef(null);

  const openPostModal = () => setShowPostModal(true);

  const showFollowBtn = currentUser?.id !== post.author._id;

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.delete(`/follow/${post.author._id}`);
      } else {
        await api.post(`/follow/${post.author._id}`);
      }
      onFollowChange(post.author._id, !isFollowing);
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  const handleLike = async () => {
    try {
      await api.post(`/likes/${post._id}`);
      setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
      setLiked((prev) => !prev);
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleCommentAdded = (comment) => {
    setComments((prev) => [...prev, comment]);
  };

  const formatTime = (dateStr) => {
    const diff = Math.floor((now - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  // Проверяем, обрезалось ли описание поста до 2 строк
  useLayoutEffect(() => {
    const el = descriptionRef.current;
    if (el) {
      setIsDescriptionTruncated(el.scrollHeight > el.clientHeight);
    } else {
      setIsDescriptionTruncated(false);
    }
  }, [post.description]);

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
          <span className={styles.username}>{post.author.username}</span>
        </div>

        <span className={styles.dot}>•</span>
        <span className={styles.time}>{formatTime(post.createdAt)}</span>

        {showFollowBtn && (
          <>
            <span className={styles.dot}>•</span>
            <button
              className={`${styles.followBtn} ${isFollowing ? styles.unfollowBtn : ""}`}
              onClick={handleFollow}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          </>
        )}
      </div>

      <div className={styles.imageWrapper} onClick={openPostModal}>
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
        <button className={styles.actionBtn} onClick={openPostModal}>
          💬
        </button>
      </div>

      <div className={styles.likes}>{likesCount} likes</div>

      {post.description && (
        <div className={styles.descriptionWrapper}>
          <div className={styles.description} ref={descriptionRef}>
            <span className={styles.descUsername}>
              {post.author.username}
            </span>{" "}
            {post.description}
          </div>
          {isDescriptionTruncated && (
            <span className={styles.more} onClick={openPostModal}>
              more
            </span>
          )}
        </div>
      )}

      {showPostModal && (
        <PostModal
          post={post}
          comments={comments}
          likesCount={likesCount}
          liked={liked}
          onLikeToggle={handleLike}
          onCommentAdded={handleCommentAdded}
          onClose={() => setShowPostModal(false)}
        />
      )}
    </div>
  );
}

export default PostCard;
