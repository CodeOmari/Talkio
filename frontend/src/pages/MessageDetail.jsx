import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import "../styles/MessageDetails.css";
import { ACCESS_TOKEN } from "../constants";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import Swal from "sweetalert2";
import ChatSidebar from "../components/ChatSidebar";

function getInitials(name = "") {
  return name.trim().slice(0, 2).toUpperCase() || "U";
}

export default function MessageDetail() {
  const baseURL = "/talkio";
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem(ACCESS_TOKEN);
  const decoded = token ? jwtDecode(token) : null;
  const user_id = decoded?.user_id ? Number(decoded.user_id) : null;

  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState([]);
  const [profile, setProfile] = useState({});
  const [myProfile, setMyProfile] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    if (!user_id) return;
    api.get(`${baseURL}/profile/${user_id}/`).then((res) => setMyProfile(res.data)).catch((err) => console.log(err));
  }, [user_id]);

  useEffect(() => {
    if (!user_id) return;
    api.get(`${baseURL}/my-messages/${user_id}/`).then((res) => setMessages(res.data)).catch((err) => console.log(err));
  }, [user_id]);

  useEffect(() => {
    if (!user_id || !id) return;
    const fetchConversation = () => {
      api.get(`${baseURL}/get-messages/${user_id}/${id}/`)
        .then((res) => setConversation(res.data))
        .catch((err) => console.log(err));
    };
    fetchConversation();
    const interval = setInterval(fetchConversation, 3000);
    return () => clearInterval(interval);
  }, [user_id, id]);

  useEffect(() => {
    if (!id) return;
    api.get(`${baseURL}/profile/${id}/`).then((res) => setProfile(res.data)).catch((err) => console.log(err));
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [conversation]);

  const uniqueConversation = React.useMemo(() => {
    const seen = new Set();
    return conversation.filter((msg) => {
      const key = msg.id ?? `${msg.sender.id}-${msg.sent_at}-${msg.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [conversation]);


  const conversations = React.useMemo(() => {
    const map = new Map();
    messages.forEach((msg) => {
      const otherId = msg.sender.id === user_id ? msg.receiver.id : msg.sender.id;
      const existing = map.get(otherId);
      if (!existing || new Date(msg.sent_at) > new Date(existing.sent_at)) {
        map.set(otherId, msg);
      }
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
  }, [messages, user_id]);

  const handleNewConversation = async () => {
    const { value: uname } = await Swal.fire({
      title: "Start a new conversation",
      input: "text",
      inputPlaceholder: "Enter a username",
      showCancelButton: true,
      confirmButtonText: "Search",
      confirmButtonColor: "#5b4fe5",
    });
    if (!uname || !uname.trim()) return;
    try {
      const response = await api.get(`${baseURL}/search/${uname.trim()}/`);
      if (!response.data || response.data.length === 0) {
        Swal.fire({ title: "User not found", icon: "warning", timer: 2000, showConfirmButton: false });
        return;
      }
      navigate(`/inbox/${response.data[0].user.id}`);
    } catch (error) {
      Swal.fire({ title: "Search failed", icon: "error", timer: 2000, showConfirmButton: false });
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const formData = new FormData();
    formData.append("sender", user_id);
    formData.append("receiver", id);
    formData.append("message", newMessage);
    formData.append("is_read", false);

    api.post(`${baseURL}/send-message/`, formData)
      .then(() => {
        setNewMessage("");
        api.get(`${baseURL}/get-messages/${user_id}/${id}/`)
          .then((res) => setConversation(res.data))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  };

  const displayName = profile?.user?.username || profile?.full_name || "";

  return (
    <main className="beam-app">
      <div className="beam-shell">
        <ChatSidebar
          myProfile={myProfile}
          conversations={conversations}
          currentUserId={user_id}
          activeUserId={Number(id)}
          onNewConversation={handleNewConversation}
          onLogout={handleLogout}
        />

        <div className="beam-main chat-panel">
          <div className="chat-panel-header d-flex align-items-center p-3 border-bottom">
            <div className="avatar">{getInitials(displayName)}</div>
            <div className="ms-2">
              <div className="chat-panel-name">@{displayName}</div>
              <div className="chat-panel-sub text-muted">Direct message</div>
            </div>
          </div>

          <div className="chat-panel-body" ref={scrollRef}>
            {uniqueConversation.length === 0 ? (
              <div className="chat-empty text-center">
                <h6>No conversation yet</h6>
                <button className="btn-new-convo mt-3" onClick={() => setNewMessage("Hi 👋")}>
                  Start Conversation
                </button>
              </div>
            ) : (
              uniqueConversation.map((msg) => {
                const isMe = Number(msg.sender.id) === Number(user_id);
                const key = msg.id || `${msg.sender.id}-${msg.sent_at}`;
                return (
                  <div key={key} className={`bubble-row d-flex ${isMe ? "justify-content-end me" : "justify-content-start them"}`}>
                    <div className="bubble">
                      <span>{Array.isArray(msg.message) ? msg.message.join(" ") : msg.message}</span>
                      <div className="bubble-time">{moment.utc(msg.sent_at).local().format("MMM D")}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="chat-panel-input d-flex align-items-center p-3 border-top">
            <input
              type="text"
              className="form-control"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={`Message @${displayName}`}
            />
            <button className="send-btn ms-2" onClick={sendMessage}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}