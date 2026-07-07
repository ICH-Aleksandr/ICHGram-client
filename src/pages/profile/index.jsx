import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import PostMenu from "../../components/PostMenu";
import PostModal from "../../components/PostModal";
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
  const [selectedPost, setSelectedPost] = useState(null);

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

  const openPostModal = async (post) => {
    try {
      const [likesRes, commentsRes] = await Promise.all([
        api.get(`/likes/${post._id}`),
        api.get(`/comments/${post._id}`),
      ]);
      setSelectedPost({
        ...post,
        likesCount: likesRes.data.count,
        likedByMe: likesRes.data.likes.some(
          (like) => like.user._id === currentUser?.id,
        ),
        comments: commentsRes.data,
      });
    } catch (error) {
      console.error("Post fetch error:", error);
      setSelectedPost({ ...post, likesCount: 0, likedByMe: false, comments: [] });
    }
  };

  const handleModalLike = async () => {
    if (!selectedPost) return;
    try {
      await api.post(`/likes/${selectedPost._id}`);
      setSelectedPost((prev) => ({
        ...prev,
        likedByMe: !prev.likedByMe,
        likesCount: prev.likedByMe ? prev.likesCount - 1 : prev.likesCount + 1,
      }));
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleModalCommentAdded = (comment) => {
    setSelectedPost((prev) => ({
      ...prev,
      comments: [...prev.comments, comment],
    }));
  };

  const handleModalFollowChange = (authorId, nextIsFollowing) => {
    setIsFollowing(nextIsFollowing);
    setFollowersCount((prev) => (nextIsFollowing ? prev + 1 : prev - 1));
  };

  const handleModalPostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    setSelectedPost(null);
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
          <div
            key={post._id}
            className={styles.postThumb}
            onClick={() => openPostModal(post)}
          >
            <img src={post.image} alt="post" />
            {isOwnProfile && (
              <button
                className={styles.menuBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setPostMenu(post._id);
                }}
              >
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

      {selectedPost && (
        <PostModal
          post={selectedPost}
          comments={selectedPost.comments}
          likesCount={selectedPost.likesCount}
          liked={selectedPost.likedByMe}
          onLikeToggle={handleModalLike}
          onCommentAdded={handleModalCommentAdded}
          onClose={() => setSelectedPost(null)}
          isFollowing={isFollowing}
          onFollowChange={handleModalFollowChange}
          onPostDeleted={handleModalPostDeleted}
        />
      )}
    </div>
  );
}

export default Profile;
