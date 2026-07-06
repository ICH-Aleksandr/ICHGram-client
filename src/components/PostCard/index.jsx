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
          {liked ? (
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="#ed4956"
              stroke="#ed4956"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          ) : (
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#262626"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
        </button>

        <button className={styles.actionBtn} onClick={openPostModal}>
          <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
            <path
              d="M17.7913 14.6494C18.8379 12.839 19.1897 10.7094 18.7808 8.65865C18.3719 6.60785 17.2304 4.77604 15.5696 3.50543C13.9087 2.23482 11.842 1.61232 9.75571 1.75423C7.66937 1.89613 5.70604 2.79272 4.23251 4.27652C2.75898 5.76031 1.87603 7.72981 1.74861 9.81708C1.62119 11.9044 2.25801 13.9666 3.54012 15.6186C4.82222 17.2707 6.66191 18.3994 8.71549 18.794C10.7691 19.1887 12.8961 18.8222 14.6992 17.763L18.9489 18.9491L17.7913 14.6494Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className={styles.likes}>{likesCount} likes</div>

      {post.description && (
        <div className={styles.descriptionWrapper}>
          <div className={styles.description} ref={descriptionRef}>
            <span className={styles.descUsername}>{post.author.username}</span>{" "}
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
