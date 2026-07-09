import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
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
import SearchPanel from "../components/SearchPanel";
import Footer from "./Footer";
import styles from "./styles.module.css";

function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector((state) => state.auth.user);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setShowSearchPanel(false);
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const closeSearchPanel = () => setShowSearchPanel(false);
  const toggleSearchPanel = () => setShowSearchPanel((prev) => !prev);
  const openCreateModal = () => {
    closeSearchPanel();
    setShowCreateModal(true);
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
              onClick={closeSearchPanel}
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <img src={homeIcon} alt="" className={styles.navIcon} />
              <span className={styles.navLabel}>Home</span>
            </NavLink>
            <button
              type="button"
              className={`${styles.navButton} ${showSearchPanel ? styles.active : ""}`}
              onClick={toggleSearchPanel}
            >
              <img src={searchIcon} alt="" className={styles.navIcon} />
              <span className={styles.navLabel}>Search</span>
            </button>
            <NavLink
              to="/explore"
              onClick={closeSearchPanel}
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <img src={exploreIcon} alt="" className={styles.navIcon} />
              <span className={styles.navLabel}>Explore</span>
            </NavLink>
            <NavLink
              to="/messages"
              onClick={closeSearchPanel}
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <img src={messagesIcon} alt="" className={styles.navIcon} />
              <span className={styles.navLabel}>Messages</span>
            </NavLink>
            <NavLink
              to="/notifications"
              onClick={closeSearchPanel}
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <img src={notificationsIcon} alt="" className={styles.navIcon} />
              <span className={styles.navLabel}>Notifications</span>
            </NavLink>
            <button
              type="button"
              className={styles.navButton}
              onClick={openCreateModal}
            >
              <img src={createIcon} alt="" className={styles.navIcon} />
              <span className={styles.navLabel}>Create</span>
            </button>
            <NavLink
              to="/profile"
              onClick={closeSearchPanel}
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
              <span className={styles.navLabel}>Profile</span>
            </NavLink>
            <button
              type="button"
              className={`${styles.navButton} ${styles.mobileLogoutBtn}`}
              onClick={handleLogout}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.navIcon}
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className={styles.navLabel}>Log out</span>
            </button>
          </nav>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            Log out
          </button>
        </aside>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>

      <Footer onOpenSearch={toggleSearchPanel} onOpenCreate={openCreateModal} />

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handlePostCreated}
        />
      )}

      {showSearchPanel && (
        <SearchPanel onClose={() => setShowSearchPanel(false)} />
      )}
    </div>
  );
}

export default Layout;
