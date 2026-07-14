import background from "../../assets/images/Background.png";
import styles from "./styles.module.css";

function NotFound() {
  return (
    <div className={styles.page}>
      <img src={background} alt="" className={styles.image} />

      <div className={styles.text}>
        <h1 className={styles.title}>Oops! Page Not Found (404 Error)</h1>
        <p className={styles.description}>
          We&apos;re sorry, but the page you&apos;re looking for doesn&apos;t
          seem to exist.
          <br />
          If you typed the URL manually, please double-check the spelling.
          <br />
          If you clicked on a link, it may be outdated or broken.
        </p>
      </div>
    </div>
  );
}

export default NotFound;
