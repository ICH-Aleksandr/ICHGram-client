import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import PostMenu from "../../components/PostMenu";
import linkIcon from "../../assets/icons/Img_link.png";
import styles from "./styles.module.css";

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const postsRefreshFlag = useSelector((state) => state.posts.lastCreatedAt);

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [postMenu, setPostMenu] = useState(null);

  const profileId = id || currentUser?.id;
  const isOwnProfile = !id || id === currentUser?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const [userRes, postsRes, followersRes, followingRes] = await Promise.all([
          api.get(`/users/${profileId}`),
          api.get(`/posts/user/${profileId}`),
          api.get(`/follow/${profileId}/followers`),
          api.get(`/follow/${profileId}/following`),
        ]);
        setUser(userRes.data);
        setPosts(postsRes.data);
        setFollowersCount(followersRes.data.count);
        setFollowingCount(followingRes.data.count);

        if (!isOwnProfile) {
          const isFollow = followersRes.data.followers.some(
            (f) => f.follower_id._id === currentUser?.id,
          );
          setIsFollowing(isFollow);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (profileId) fetchProfile();
  }, [profileId, postsRefreshFlag, currentUser?.id, isOwnProfile]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.delete(`/follow/${profileId}`);
        setFollowersCount((prev) => prev - 1);
      } else {
        await api.post(`/follow/${profileId}`);
        setFollowersCount((prev) => prev + 1);
      }
      setIsFollowing((prev) => !prev);
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setPostMenu(null);
    } catch (error) {
      console.error("Delete post error:", error);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!user) return <div className={styles.loading}>User not found</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          {user.profile_image ? (
            <img src={user.profile_image} alt={user.username} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {user.username?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <div className={styles.info}>
          <div className={styles.topRow}>
            <span className={styles.username}>{user.username}</span>
            {isOwnProfile ? (
              <button className={styles.editBtn} onClick={() => navigate("/edit-profile")}>
                Edit profile
              </button>
            ) : (
              <button
                className={isFollowing ? styles.unfollowBtn : styles.followBtn}
                onClick={handleFollow}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>

          <div className={styles.stats}>
            <span><b>{posts.length}</b> posts</span>
            <span><b>{followersCount}</b> followers</span>
            <span><b>{followingCount}</b> following</span>
          </div>

          {user.bio && <p className={styles.bio}>{user.bio}</p>}

          {user.website && (
            <a
              className={styles.website}
              href={
                user.website.startsWith("http")
                  ? user.website
                  : `https://${user.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={linkIcon} alt="link" className={styles.websiteIcon} />
              {user.website}
            </a>
          )}
        </div>
      </div>

      <div className={styles.postsGrid}>
        {posts.map((post) => (
          <div key={post._id} className={styles.postThumb}>
            <img src={post.image} alt="post" />
            {isOwnProfile && (
              <button className={styles.menuBtn} onClick={() => setPostMenu(post._id)}>
                ···
              </button>
            )}
          </div>
        ))}
      </div>

      {postMenu && (
        <PostMenu
          onDelete={() => handleDeletePost(postMenu)}
          onEdit={() => setPostMenu(null)}
          onClose={() => setPostMenu(null)}
        />
      )}
    </div>
  );
}

export default Profile;
