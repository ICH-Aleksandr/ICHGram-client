import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.authBox}>
        <div className={styles.card}>
          <div className={styles.iconCircle}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#262626"
              strokeWidth="1.6"
            >
              <rect x="5" y="11" width="14" height="9" rx="1.5" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </div>

          <h2 className={styles.title}>Trouble logging in?</h2>

          <p className={styles.subtitle}>
            Enter your email, phone, or username and we'll send you a link to
            get back into your account.
          </p>

          <input
            className={styles.input}
            type="text"
            placeholder="Email or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <button className={styles.btn} type="button">
            Reset your password
          </button>

          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>OR</span>
            <span className={styles.dividerLine} />
          </div>

          <a className={styles.createAccount} href="#">
            Create new account
          </a>
        </div>

        <div className={styles.switchCard}>
          <p className={styles.toggle} onClick={() => navigate("/login")}>
            Back to login
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
