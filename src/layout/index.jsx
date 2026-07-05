import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, setCredentials } from "../redux/slices/authSlice";
import { postCreated } from "../redux/slices/postsSlice";
import api from "../api/axios";
import logo from "../assets/logo/ICHGram_logo01.png";
import homeIcon from "../assets/icons/Img_Home.png";
import searchIcon from "../assets/icons/Img_Search.png";
import exploreIcon from "../assets/icons/Img_Explore.png";
import messagesIcon from "../assets/icons/Img_Messenger.png";
import notificationsIcon from "../assets/icons/Img_Notification.png";
import createIcon from "../assets/icons/Img_Create.png";
import CreatePostModal from "../components/CreatePostModal";
import Footer from "./Footer";
import styles from "./styles.module.css";

function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/auth/me");
        dispatch(
          setCredentials({
            token: localStorage.getItem("token"),
            user: {
              id: res.data._id,
              username: res.data.username,
              full_name: res.data.full_name,
              email: res.data.email,
              bio: res.data.bio,
              website: res.data.website,
              profile_image: res.data.profile_image,
            },
          }),
        );
      } catch (error) {
        console.error("Fetch current user error:", error);
      }
    };

    fetchMe();
  }, [dispatch]);

  const handlePostCreated = () => {
    setShowCreateModal(false);
    dispatch(postCreated());
    navigate("/profile");
  };

  return (
    <div className={styles.page}>
      <div className={styles.row}>
        <aside className={styles.sidebar}>
          <img src={logo} alt="ICHGRAM" className={styles.logo} />

          <nav className={styles.nav}>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <img src={homeIcon} alt="" className={styles.navIcon} />
              Home
            </NavLink>
            <NavLink
              to="/search"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <img src={searchIcon} alt="" className={styles.navIcon} />
              Search
            </NavLink>
            <NavLink
              to="/explore"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <img src={exploreIcon} alt="" className={styles.navIcon} />
              Explore
            </NavLink>
            <NavLink
              to="/messages"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <img src={messagesIcon} alt="" className={styles.navIcon} />
              Messages
            </NavLink>
            <NavLink
              to="/notifications"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <img src={notificationsIcon} alt="" className={styles.navIcon} />
              Notifications
            </NavLink>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => setShowCreateModal(true)}
            >
              <img src={createIcon} alt="" className={styles.navIcon} />
              Create
            </button>
            <NavLink
              to="/profile"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              {currentUser?.profile_image ? (
                <img
                  src={currentUser.profile_image}
                  alt=""
                  className={styles.profileIcon}
                />
              ) : (
                <div className={styles.profilePlaceholder}>
                  {currentUser?.username?.[0]?.toUpperCase()}
                </div>
              )}
              Profile
            </NavLink>
          </nav>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            Log out
          </button>
        </aside>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>

      <Footer />

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handlePostCreated}
        />
      )}
    </div>
  );
}

export default Layout;
