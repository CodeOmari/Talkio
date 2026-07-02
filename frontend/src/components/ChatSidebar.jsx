import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import "../styles/ChatSidebar.css";

function getInitials(name = "") {
  return name.trim().slice(0, 2).toUpperCase() || "U";
}

export default function ChatSidebar({
  myProfile,
  conversations,
  currentUserId,
  activeUserId,
  onNewConversation,
  onLogout,
}) {
  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header d-flex align-items-center justify-content-between p-3 border-bottom">
        <div className="brand d-flex align-items-center">
          <span className="brand-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <div className="ms-2">
            <div className="brand-name">Talkio</div>
            <div className="brand-user">@{myProfile?.user?.username || myProfile?.username || "..."}</div>
          </div>
        </div>
        <button className="icon-btn" onClick={onLogout} title="Logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      <div className="p-3">
        <button className="btn-new-convo w-100" onClick={onNewConversation}>
          <span className="plus">+</span> New conversation
        </button>
      </div>

      <div className="chat-list">
        {conversations.length === 0 ? (
          <div className="empty-list text-center text-muted">
            No chats yet. Start one by username.
          </div>
        ) : (
          conversations.map((msg) => {
            const otherUser = msg.sender.id === currentUserId ? msg.receiver : msg.sender;
            const profile = msg.sender.id === currentUserId ? msg.receiver_profile : msg.sender_profile;
            const displayName = profile?.user?.username || otherUser.username;
            const isActive = Number(activeUserId) === Number(otherUser.id);

            return (
              <Link
                key={otherUser.id}
                to={`/inbox/${otherUser.id}`}
                className={`chat-list-item d-flex align-items-center text-decoration-none ${isActive ? "active" : ""}`}
              >
                <div className="avatar">{getInitials(displayName)}</div>
                <div className="chat-list-info flex-grow-1 ms-2">
                  <div className="chat-list-name text-truncate">@{displayName}</div>
                </div>
                <div className="chat-list-date">
                  {moment.utc(msg.sent_at).local().format("MMM D")}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}