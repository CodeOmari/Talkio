import React, { useState, useEffect } from "react";
import "../styles/Message.css";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import ChatSidebar from "../components/ChatSidebar";

export default function Message() {
  const baseURL = "/talkio";
  const [messages, setMessages] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem(ACCESS_TOKEN);

  let user_id = null;
  if (token) {
    const decoded = jwtDecode(token);
    user_id = decoded.user_id;
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    if (!user_id) return;
    api.get(`${baseURL}/profile/${user_id}/`).then((res) => setMyProfile(res.data)).catch(console.error);
  }, [user_id]);

  useEffect(() => {
    if (!user_id) return;
    api.get(`${baseURL}/my-messages/${user_id}/`)
      .then((res) => setMessages(res.data))
      .catch((error) => {
        console.error(error);
        Swal.fire({ title: "Error loading messages", icon: "error" });
      });
  }, [user_id]);

 
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
      console.error(error);
      Swal.fire({ title: "Search failed", icon: "error", timer: 2000, showConfirmButton: false });
    }
  };

  return (
    <main className="beam-app">
      <div className="beam-shell">
        <ChatSidebar
          myProfile={myProfile}
          conversations={conversations}
          currentUserId={user_id}
          activeUserId={null}
          onNewConversation={handleNewConversation}
          onLogout={handleLogout}
        />

        <div className="beam-main empty-panel d-flex flex-column align-items-center justify-content-center">
          <div className="empty-panel-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h5 className="mt-3 mb-1">Pick a chat</h5>
          <p className="text-muted text-center px-3">
            Select a conversation on the left, or start a new one with someone's username.
          </p>
        </div>
      </div>
    </main>
  );
}