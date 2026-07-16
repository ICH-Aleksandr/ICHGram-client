import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import styles from "./styles.module.css";

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);

  const units = [
    { label: "y", secs: 31536000 },
    { label: "w", secs: 604800 },
    { label: "d", secs: 86400 },
    { label: "h", secs: 3600 },
    { label: "m", secs: 60 },
  ];

  for (const { label, secs } of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) {
      return `${value}${label}`;
    }
  }

  return "now";
}

function actionText(type) {
  if (type === "like") return "liked your photo.";
  if (type === "comment") return "commented on your photo.";
  if (type === "follow") return "started following you.";
  if (type === "message") return "sent you a message.";
  return "";
}

function NotificationsPanel({ onClose }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data);
      } catch (error) {
        console.error("Fetch notifications error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    api.patch("/notifications/read").catch(() => {});
  }, []);

  const handleSelect = (notification) => {
    if (!notification.sender?._id) return;
    onClose();
    if (notification.type === "message") {
      navigate("/messages", { state: { openUserId: notification.sender._id } });
      return;
    }
    navigate(`/profile/${notification.sender._id}`);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Notifications</h2>

        {!loading && notifications.length > 0 && (
          <div className={styles.sectionLabel}>New</div>
        )}

        <div className={styles.list}>
          {loading && <div className={styles.empty}>Loading...</div>}

          {!loading && notifications.length === 0 && (
            <div className={styles.empty}>No notifications yet</div>
          )}

          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={styles.row}
              onClick={() => handleSelect(notification)}
            >
              <div className={styles.avatar}>
                {notification.sender?.profile_image ? (
                  <img
                    src={notification.sender.profile_image}
                    alt={notification.sender.username}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {notification.sender?.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              <div className={styles.info}>
                <div className={styles.textLine}>
                  <span className={styles.username}>
                    {notification.sender?.username}
                  </span>{" "}
                  <span className={styles.action}>
                    {actionText(notification.type)}
                  </span>
                </div>
                <div className={styles.time}>
                  {timeAgo(notification.createdAt)}
                </div>
              </div>

              {notification.post?.image && (
                <img
                  src={notification.post.image}
                  alt=""
                  className={styles.thumbnail}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPanel;
