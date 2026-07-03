import { NavLink } from "react-router-dom";
import styles from "./styles.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <nav className={styles.links}>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/search">Search</NavLink>
        <NavLink to="/explore">Explore</NavLink>
        <NavLink to="/messages">Messages</NavLink>
        <NavLink to="/notifications">Notifications</NavLink>
        <NavLink to="/create">Create</NavLink>
      </nav>

      <p className={styles.copyright}>© 2024 ICHgram</p>
    </footer>
  );
}

export default Footer;
