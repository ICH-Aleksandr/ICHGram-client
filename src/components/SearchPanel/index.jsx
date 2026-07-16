import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import styles from "./styles.module.css";

const RECENT_KEY = "ichgram_recent_search";
const RECENT_LIMIT = 5;

function loadRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecent(list) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    // ignore storage errors
  }
}

function SearchPanel({ onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [recent, setRecent] = useState(() => loadRecent());
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await api.get("/search/users", {
          params: { query: trimmed },
        });
        setResults(response.data);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectUser = (user) => {
    const next = [user, ...recent.filter((r) => r._id !== user._id)].slice(
      0,
      RECENT_LIMIT,
    );
    setRecent(next);
    saveRecent(next);
    onClose();
    navigate(`/profile/${user._id}`);
  };

  const isSearching = query.trim().length > 0;
  const list = isSearching ? results : recent;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Search</h2>

        <div className={styles.searchInputWrap}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            ✕
          </button>
        </div>

        {!isSearching && list.length > 0 && (
          <div className={styles.sectionLabel}>Recent</div>
        )}

        <div className={styles.results}>
          {list.map((user) => (
            <div
              key={user._id}
              className={styles.resultRow}
              onClick={() => handleSelectUser(user)}
            >
              <div className={styles.avatar}>
                {user.profile_image ? (
                  <img src={user.profile_image} alt={user.username} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <span className={styles.username}>{user.username}</span>
            </div>
          ))}

          {isSearching && results.length === 0 && (
            <div className={styles.empty}>No results found</div>
          )}

          {!isSearching && recent.length === 0 && (
            <div className={styles.empty}>No recent searches</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPanel;
