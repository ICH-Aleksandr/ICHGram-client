import { useState } from "react";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import styles from "./styles.module.css";

function CreatePostModal({ onClose, onCreated }) {
  const currentUser = useSelector((state) => state.auth.user);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
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

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div className={styles.header}>
          <span className={styles.title}>Create new post</span>
          <button
            className={styles.shareBtn}
            onClick={handleCreate}
            disabled={!imageFile || loading}
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.imageArea}>
            {preview ? (
              <img src={preview} alt="preview" className={styles.preview} />
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
              className={styles.textarea}
              placeholder="Write a caption..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2200}
            />
            <div className={styles.footerRow}>
              <span className={styles.charCount}>{description.length} / 2200</span>
            </div>
            <div className={styles.emojiRow}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CreatePostModal;
