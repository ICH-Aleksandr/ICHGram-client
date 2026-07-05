import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "../../redux/slices/authSlice";
import api from "../../api/axios";
import styles from "./styles.module.css";
import linkIcon from "../../assets/icons/Img_link.png";

function EditProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);

  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetching(true);
        const res = await api.get(`/users/${currentUser.id}`);
        setUser(res.data);
        setUsername(res.data.username || "");
        setWebsite(res.data.website || "");
        setBio(res.data.bio || "");
        setPreview(res.data.profile_image || "");
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setFetching(false);
      }
    };

    if (currentUser?.id) fetchProfile();
  }, [currentUser?.id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      const formData = new FormData();
      formData.append("username", username);
      formData.append("bio", bio);
      formData.append("website", website);
      if (imageFile) {
        formData.append("profile_image", imageFile);
      }
      const response = await api.put("/users/update", formData);
      dispatch(
        setCredentials({
          token: localStorage.getItem("token"),
          user: { ...currentUser, ...response.data },
        }),
      );
      navigate("/profile");
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className={styles.loading}>Loading...</div>;
  if (!user) return <div className={styles.loading}>User not found</div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Edit profile</h1>

      <div className={styles.card}>
        <div className={styles.cardLeft}>
          <div className={styles.avatar}>
            {preview ? (
              <img src={preview} alt="avatar" />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className={styles.avatarUsername}>{user.username}</p>
            {user.bio && <p className={styles.avatarBio}>{user.bio}</p>}
          </div>
        </div>
        <label className={styles.newPhotoBtn}>
          New photo
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />
        </label>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.field}>
        <label className={styles.label}>Username</label>
        <input
          className={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Website</label>
        <div className={styles.inputWithIcon}>
          <img src={linkIcon} alt="link" className={styles.linkIcon} />

          <input
            className={styles.inputPlain}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="Website"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>About</label>
        <div className={styles.textareaWrap}>
          <textarea
            className={styles.textarea}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={150}
          />
          <span className={styles.charCount}>{bio.length} / 150</span>
        </div>
      </div>

      <button
        className={styles.saveBtn}
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

export default EditProfile;
