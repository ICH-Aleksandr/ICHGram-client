import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../../redux/slices/authSlice";
import api from "../../api/axios";
import logo1 from "../../assets/logo/ICHGram_logo01.png";
import logo2 from "../../assets/logo/ICHGram_logo02.png";
import background from "../../assets/images/Background.png";
import styles from "./styles.module.css";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const [registerErrors, setRegisterErrors] = useState({
    email: "",
    username: "",
    general: "",
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError("");
      const response = await api.post("/auth/login", { email, password });
      dispatch(setCredentials(response.data));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login error");
    }
  };

  const handleRegister = async () => {
    try {
      setRegisterErrors({ email: "", username: "", general: "" });
      const response = await api.post("/auth/register", {
        email,
        password,
        username,
        full_name: fullName,
      });
      dispatch(setCredentials(response.data));
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      const nextErrors = { email: "", username: "", general: "" };

      if (data?.errors?.username || data?.errors?.email) {
        nextErrors.username = data.errors.username || "";
        nextErrors.email = data.errors.email || "";
      } else if (data?.field === "username" || data?.field === "email") {
        nextErrors[data.field] = data.message || "Registration error";
      } else {
        const message = data?.message || "Registration error";

        if (/username/i.test(message)) {
          nextErrors.username = message;
        } else if (/email/i.test(message)) {
          nextErrors.email = message;
        } else {
          nextErrors.general = message;
        }
      }

      setRegisterErrors(nextErrors);
    }
  };

  if (isLogin) {
    return (
      <div className={styles.page}>
        <div className={styles.splitWrapper}>
          <img src={background} alt="" className={styles.graphic} />

          <div className={styles.authBox}>
            <div className={styles.card}>
              <img src={logo1} alt="ICHGRAM" className={styles.logo} />

              <input
                className={styles.input}
                type="email"
                placeholder="Username, or email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className={styles.input}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && <p className={styles.error}>{error}</p>}

              <button className={styles.btn} onClick={handleLogin}>
                Log in
              </button>

              <div className={styles.divider}>
                <span className={styles.dividerLine} />
                <span className={styles.dividerText}>OR</span>
                <span className={styles.dividerLine} />
              </div>

              <a
                className={styles.forgot}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/forgot-password");
                }}
              >
                Forgot password?
              </a>
            </div>

            <div className={styles.switchCard}>
              <p className={styles.toggle}>
                Don't have an account?{" "}
                <span onClick={() => setIsLogin(false)}>Sign up</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.authBox}>
        <div className={styles.card}>
          <img src={logo2} alt="ICHGRAM" className={styles.logo} />

          <p className={styles.subtitle}>
            Sign up to see photos and videos from your friends.
          </p>

          <input
            className={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {registerErrors.email && (
            <p className={styles.fieldError}>{registerErrors.email}</p>
          )}
          <input
            className={styles.input}
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {registerErrors.username && (
            <p className={styles.fieldError}>{registerErrors.username}</p>
          )}
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <p className={styles.disclaimer}>
            People who use our service may have uploaded your contact
            information to Instagram. <a href="#">Learn More</a>
          </p>

          <p className={styles.terms}>
            By signing up, you agree to our <a href="#">Terms</a>,{" "}
            <a href="#">Privacy Policy</a> and <a href="#">Cookies Policy</a>.
          </p>

          {registerErrors.general && (
            <p className={styles.error}>{registerErrors.general}</p>
          )}

          <button
            className={`${styles.btn} ${styles.btn2}`}
            onClick={handleRegister}
          >
            Sign up
          </button>
        </div>

        <div className={`${styles.switchCard} ${styles.switchCard2}`}>
          <p className={styles.toggle}>
            Have an account?{" "}
            <span onClick={() => setIsLogin(true)}>Log in</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
