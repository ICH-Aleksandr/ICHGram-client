import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import EmojiPicker from "emoji-picker-react";
import api from "../../api/axios";
import styles from "./styles.module.css";

function CreatePostModal({ onClose, onCreated, post, onUpdated }) {
  const currentUser = useSelector((state) => state.auth.user);
  const isEditing = Boolean(post);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(post?.image || null);
  const [description, setDescription] = useState(post?.description || "");
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    if (!preview) return undefined;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => {
    if (!showEmojiPicker) return undefined;

    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleEmojiSelect = (emojiData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? description.length;
    const end = textarea?.selectionEnd ?? description.length;

    const next = description.slice(0, start) + emoji + description.slice(end);
    if (next.length > 2200) return;

    setDescription(next);
    setShowEmojiPicker(false);

    requestAnimationFrame(() => {
      if (!textarea) return;
      textarea.focus();
      const cursor = start + emoji.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const handleCreate = async () => {
    if (!imageFile) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("description", description);
      const response = await api.post("/posts", formData);
      onCreated(response.data);
      onClose();
    } catch (error) {
      console.error("Create post error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("description", description);
      if (imageFile) formData.append("image", imageFile);
      const response = await api.put(`/posts/${post._id}`, formData);
      onUpdated(response.data);
      onClose();
    } catch (error) {
      console.error("Update post error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div className={styles.header}>
          <span className={styles.title}>
            {isEditing ? "Edit post" : "Create new post"}
          </span>
          <button
            className={styles.shareBtn}
            onClick={isEditing ? handleSave : handleCreate}
            disabled={isEditing ? loading : !imageFile || loading}
          >
            {isEditing
              ? loading
                ? "Saving..."
                : "Save"
              : loading
                ? "Sharing..."
                : "Share"}
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.imageArea}>
            {preview ? (
              <label className={styles.previewWrap}>
                <img src={preview} alt="preview" className={styles.preview} />
                {isEditing && (
                  <span className={styles.changePhoto}>Change photo</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </label>
            ) : (
              <label className={styles.uploadArea}>
                <div className={styles.uploadIcon}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#c7c7c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 16 12 12 8 16" />
                    <line x1="12" y1="12" x2="12" y2="21" />
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                  </svg>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </label>
            )}
          </div>

          <div className={styles.descArea}>
            <div className={styles.userRow}>
              <div className={styles.userAvatar}>
                {currentUser?.profile_image ? (
                  <img src={currentUser.profile_image} alt="avatar" />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {currentUser?.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <span className={styles.userName}>{currentUser?.username}</span>
            </div>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              placeholder="Write a caption..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2200}
            />
            <div className={styles.footerRow}>
              <span className={styles.charCount}>{description.length} / 2200</span>
            </div>
            <div className={styles.emojiWrap} ref={emojiPickerRef}>
              <button
                type="button"
                className={styles.emojiRow}
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
          </div>
        </div>

      </div>
    </div>
  );
}

export default CreatePostModal;
