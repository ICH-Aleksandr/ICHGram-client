import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import EmojiPicker from "emoji-picker-react";
import api from "../../api/axios";
import PostMenu from "../PostMenu";
import CreatePostModal from "../CreatePostModal";
import styles from "./styles.module.css";

function PostModal({
  post,
  comments,
  likesCount,
  liked,
  onLikeToggle,
  onCommentAdded,
  onClose,
  isFollowing,
  onFollowChange,
  onPostDeleted,
  onPostUpdated,
}) {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const isOwnPost = currentUser?.id === post.author._id;
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [now] = useState(() => Date.now());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const commentInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    if (!showEmojiPicker) return undefined;

    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  const formatTime = (dateStr) => {
    const diff = Math.floor((now - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const handleEmojiSelect = (emojiData) => {
    const emoji = emojiData.emoji;
    const input = commentInputRef.current;
    const start = input?.selectionStart ?? commentText.length;
    const end = input?.selectionEnd ?? commentText.length;

    const next = commentText.slice(0, start) + emoji + commentText.slice(end);
    setCommentText(next);
    setShowEmojiPicker(false);

    requestAnimationFrame(() => {
      if (!input) return;
      input.focus();
      const cursor = start + emoji.length;
      input.setSelectionRange(cursor, cursor);
    });
  };

  const handleGoToProfile = (userId) => {
    onClose();
    navigate(`/profile/${userId}`);
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.delete(`/follow/${post.author._id}`);
      } else {
        await api.post(`/follow/${post.author._id}`);
      }
      onFollowChange?.(post.author._id, !isFollowing);
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  const handleDeletePost = async () => {
    try {
      await api.delete(`/posts/${post._id}`);
      setShowPostMenu(false);
      onPostDeleted?.(post._id);
      onClose();
    } catch (error) {
      console.error("Delete post error:", error);
    }
  };

  const handlePostUpdated = (updatedPost) => {
    onPostUpdated?.(post._id, {
      description: updatedPost.description,
      image: updatedPost.image,
    });
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
        {isOwnPost && (
          <button
            className={styles.menuBtn}
            onClick={() => setShowPostMenu(true)}
          >
            ···
          </button>
        )}
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

            {!isOwnPost && (
              <button
                className={`${styles.followBtn} ${isFollowing ? styles.unfollowBtn : ""}`}
                onClick={handleFollow}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
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

              <button className={styles.actionBtn}>
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
            <div className={styles.time}>{formatTime(post.createdAt)} ago</div>

            <div className={styles.commentInput}>
              <div className={styles.emojiWrap} ref={emojiPickerRef}>
                <button
                  type="button"
                  className={styles.emojiBtn}
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                </button>

                {showEmojiPicker && (
                  <div className={styles.emojiPicker}>
                    <EmojiPicker
                      onEmojiClick={handleEmojiSelect}
                      width={280}
                      height={320}
                      searchDisabled={false}
                      skinTonesDisabled
                      previewConfig={{ showPreview: false }}
                    />
                  </div>
                )}
              </div>
              <input
                ref={commentInputRef}
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

      {showPostMenu && (
        <PostMenu
          onDelete={handleDeletePost}
          onEdit={() => {
            setShowPostMenu(false);
            setShowEditModal(true);
          }}
          onClose={() => setShowPostMenu(false)}
        />
      )}

      {showEditModal && (
        <CreatePostModal
          post={post}
          onClose={() => setShowEditModal(false)}
          onUpdated={handlePostUpdated}
        />
      )}
    </div>
  );
}

export default PostModal;
