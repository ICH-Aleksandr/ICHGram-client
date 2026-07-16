import { NavLink } from "react-router-dom";
import styles from "./styles.module.css";

function Footer({ onOpenSearch, onOpenNotifications, onOpenCreate }) {
  return (
    <footer className={styles.footer}>
      <nav className={styles.links}>
        <NavLink to="/">Home</NavLink>
        <button type="button" className={styles.linkBtn} onClick={onOpenSearch}>
          Search
        </button>
        <NavLink to="/explore">Explore</NavLink>
        <NavLink to="/messages">Messages</NavLink>
        <button
          type="button"
          className={styles.linkBtn}
          onClick={onOpenNotifications}
        >
          Notifications
        </button>
        <button type="button" className={styles.linkBtn} onClick={onOpenCreate}>
          Create
        </button>
      </nav>

      <p className={styles.copyright}>© 2024 ICHgram</p>
    </footer>
  );
}

export default Footer;
