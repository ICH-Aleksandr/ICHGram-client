import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import api from "../../api/axios";
import { getSocket } from "../../api/socket";
import styles from "./styles.module.css";

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString([], {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Avatar({ user, className }) {
  return user?.profile_image ? (
    <img src={user.profile_image} alt={user.username} className={className} />
  ) : (
    <div className={className}>{user?.username?.[0]?.toUpperCase()}</div>
  );
}

function Messages() {
  const currentUser = useSelector((state) => state.auth.user);
  const location = useLocation();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);

  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const activeUserRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);

  useEffect(() => {
    if (!showEmojiPicker) return undefined;

    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  const fetchConversations = async () => {
    try {
      const res = await api.get("/messages/conversations");
      setConversations(res.data);
    } catch (error) {
      console.error("Fetch conversations error:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchConversations();
    };
    load();
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return undefined;

    const socket = getSocket();
    socket.emit("joinRoom", currentUser.id);

    const handleReceiveMessage = (message) => {
      if (activeUserRef.current?._id === message.sender) {
        setMessages((prev) => [...prev, message]);
      }
      fetchConversations();
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [currentUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversation = async (user) => {
    setActiveUser(user);
    setShowNewMessage(false);
    try {
      const res = await api.get(`/messages/${user._id}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Fetch messages error:", error);
      setMessages([]);
    }
  };

  useEffect(() => {
    const openUserId = location.state?.openUserId;
    if (!openUserId) return;

    const openFromNotification = async () => {
      try {
        const res = await api.get(`/users/${openUserId}`);
        await openConversation(res.data);
      } catch (error) {
        console.error("Open conversation error:", error);
      } finally {
        navigate(location.pathname, { replace: true, state: {} });
      }
    };

    openFromNotification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !activeUser) return;

    try {
      const res = await api.post(`/messages/${activeUser._id}`, {
        text: trimmed,
      });
      setMessages((prev) => [...prev, res.data]);
      setText("");
      fetchConversations();
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  const handleEmojiSelect = (emojiData) => {
    const emoji = emojiData.emoji;
    const input = chatInputRef.current;
    const start = input?.selectionStart ?? text.length;
    const end = input?.selectionEnd ?? text.length;

    const next = text.slice(0, start) + emoji + text.slice(end);
    setText(next);
    setShowEmojiPicker(false);

    requestAnimationFrame(() => {
      if (!input) return;
      input.focus();
      const cursor = start + emoji.length;
      input.setSelectionRange(cursor, cursor);
    });
  };

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const res = await api.get("/search/users", {
          params: { query: trimmed },
        });
        setSearchResults(res.data.filter((u) => u._id !== currentUser?.id));
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentUser?.id]);

  return (
    <div className={styles.page}>
      <aside className={styles.conversations}>
        <div className={styles.conversationsHeader}>
          <span className={styles.username}>{currentUser?.username}</span>
          <button
            type="button"
            className={styles.newMessageBtn}
            onClick={() => setShowNewMessage(true)}
            title="New message"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000"
              strokeWidth="1.5"
            >
              <path d="M12 4v16m8-8H4" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className={styles.conversationsList}>
          {loadingConversations && (
            <div className={styles.empty}>Loading...</div>
          )}

          {!loadingConversations && conversations.length === 0 && (
            <div className={styles.empty}>No messages yet</div>
          )}

          {conversations.map((conversation) => (
            <div
              key={conversation.user._id}
              className={`${styles.conversationRow} ${
                activeUser?._id === conversation.user._id ? styles.activeRow : ""
              }`}
              onClick={() => openConversation(conversation.user)}
            >
              <Avatar user={conversation.user} className={styles.avatar} />
              <div className={styles.conversationInfo}>
                <span className={styles.conversationUsername}>
                  {conversation.user.username}
                </span>
                <span className={styles.lastMessage}>
                  {conversation.lastMessage}
                </span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className={styles.chat}>
        {!activeUser && (
          <div className={styles.noChatSelected}>
            <p>Select a conversation or start a new one</p>
          </div>
        )}

        {activeUser && (
          <>
            <div className={styles.chatHeader}>
              <Avatar user={activeUser} className={styles.avatarSmall} />
              <span className={styles.chatUsername}>
                {activeUser.username}
              </span>
            </div>

            <div className={styles.messagesList}>
              {messages.map((message) => {
                const isMine = message.sender === currentUser?.id;
                return (
                  <div
                    key={message._id}
                    className={`${styles.messageRow} ${
                      isMine ? styles.messageMine : styles.messageTheirs
                    }`}
                  >
                    {!isMine && (
                      <Avatar user={activeUser} className={styles.messageAvatar} />
                    )}
                    <div className={styles.messageContent}>
                      <div className={styles.messageBubble}>{message.text}</div>
                      <span className={styles.messageTime}>
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                    {isMine && (
                      <Avatar user={currentUser} className={styles.messageAvatar} />
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form className={styles.chatInputRow} onSubmit={handleSend}>
              <div className={styles.emojiWrap} ref={emojiPickerRef}>
                <button
                  type="button"
                  className={styles.emojiBtn}
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                </button>

                {showEmojiPicker && (
                  <div className={styles.emojiPicker}>
                    <EmojiPicker
                      onEmojiClick={handleEmojiSelect}
                      width={280}
                      height={320}
                      searchDisabled={false}
                      skinTonesDisabled
                      previewConfig={{ showPreview: false }}
                    />
                  </div>
                )}
              </div>
              <input
                ref={chatInputRef}
                type="text"
                placeholder="Message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className={styles.chatInput}
              />
              <button
                type="submit"
                className={styles.sendBtn}
                disabled={!text.trim()}
              >
                Send
              </button>
            </form>
          </>
        )}
      </section>

      {showNewMessage && (
        <div
          className={styles.overlay}
          onClick={() => setShowNewMessage(false)}
        >
          <div
            className={styles.newMessagePanel}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.newMessageHeader}>
              <span>New message</span>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowNewMessage(false)}
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.newMessageSearch}
              autoFocus
            />
            <div className={styles.newMessageResults}>
              {searchQuery.trim() &&
                searchResults.map((user) => (
                <div
                  key={user._id}
                  className={styles.conversationRow}
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    openConversation(user);
                  }}
                >
                  <Avatar user={user} className={styles.avatar} />
                  <div className={styles.conversationInfo}>
                    <span className={styles.conversationUsername}>
                      {user.username}
                    </span>
                    <span className={styles.lastMessage}>
                      {user.full_name}
                    </span>
                  </div>
                </div>
              ))}
              {searchQuery.trim() && searchResults.length === 0 && (
                <div className={styles.empty}>No results found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;
