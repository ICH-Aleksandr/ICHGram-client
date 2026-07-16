import styles from "./styles.module.css";

function PostMenu({ onDelete, onEdit, onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
        <button className={`${styles.item} ${styles.danger}`} onClick={onDelete}>
          Delete
        </button>
        <button className={styles.item} onClick={onEdit}>
          Edit
        </button>
        <button className={styles.item} onClick={onClose}>
          Go to post
        </button>
        <button className={styles.item} onClick={onClose}>
          Copy link
        </button>
        <button className={styles.item} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PostMenu;
