import { useState, useEffect } from "react";
import api from "../api";
import "../styles/MessageDetails.css";
import { ACCESS_TOKEN } from "../constants";
import { Link, useParams } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import moment from "moment";

export default function MessageDetail() {
  const baseURL = "/talkio";
  const { id } = useParams();

  const token = localStorage.getItem(ACCESS_TOKEN);
  const decoded = token ? jwtDecode(token) : null;
  const user_id = decoded?.user_id ? Number(decoded.user_id) : null;

  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState([]);
  const [profile, setProfile] = useState({});
  const [myProfile, setMyProfile] = useState({});
  const [newMessage, setNewMessage] = useState("");

  // Fetch logged-in user profile
  useEffect(() => {
    if (!user_id) return;

    api.get(`${baseURL}/profile/${user_id}/`)
      .then(res => setMyProfile(res.data))
      .catch(err => console.log(err));
  }, [user_id]);

  // Fetch inbox messages
  useEffect(() => {
    if (!user_id) return;

    api.get(`${baseURL}/my-messages/${user_id}/`)
      .then(res => setMessages(res.data))
      .catch(err => console.log(err));
  }, [user_id]);

  // Fetch conversation with specific user
  useEffect(() => {
    if (!user_id || !id) return;

    const fetchConversation = () => {
      api.get(`${baseURL}/get-messages/${user_id}/${id}/`)
        .then(res => setConversation(res.data))
        .catch(err => console.log(err));
    };

    fetchConversation();
    const interval = setInterval(fetchConversation, 3000);
    return () => clearInterval(interval);
  }, [user_id, id]);

  // Fetch the profile of the other user
  useEffect(() => {
    if (!id) return;

    api.get(`${baseURL}/profile/${id}/`)
      .then(res => setProfile(res.data))
      .catch(err => console.log(err));
  }, [id]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const formData = new FormData();
    formData.append("user", user_id);
    formData.append("sender", user_id);
    formData.append("receiver", id);
    formData.append("message", newMessage);
    formData.append("is_read", false);

    api.post(`${baseURL}/send-message/`, formData)
      .then(() => setNewMessage(""))
      .catch(err => console.log(err));
  };

  return (
    <main className="content">
      <div className="container">
        <div className="row">

          {/* LEFT SIDEBAR */}
          <div className="col-md-4 border-end profile-section">
            <div className="back-btn">
              <a href="/inbox" className="link">
                <img src="../src/assets/arrow-left.svg" alt="back-arrow" />
              </a>
            </div>

            <div className="text-center p-3 border-bottom">
              <img
                src="../src/assets/default-img.png"
                className="rounded-circle"
                width="60"
                height="60"
                alt="profile"
              />
            </div>
          </div>

          {/* RIGHT SIDE CHAT */}
          <div className="col-md-8">
            <div className="p-3 border-bottom">
              <h5>{profile.full_name}</h5>
            </div>

            <div className="p-3" style={{ height: "400px", overflowY: "auto" }}>
              {conversation.length === 0 ? (
                <div className="text-center mt-5">
                  <h6>No conversation yet</h6>
                  <button
                    className="btn btn-primary mt-3"
                    onClick={() => setNewMessage("Hi 👋")}
                  >
                    Start Conversation
                  </button>
                </div>
              ) : (
                conversation.map((msg) => {
                  const isMe = Number(msg.sender.id) === Number(user_id);
                  const key = msg.id || `${msg.sender.id}-${msg.sent_at}`;

                  return (
                    <div
                      key={key}
                      className={`d-flex ${isMe ? "justify-content-end" : "justify-content-start"}`}
                    >
                      <div
                        className={`p-2 rounded m-2 ${isMe ? "bg-primary text-white" : "bg-light"}`}
                        style={{ maxWidth: "70%" }}
                      >
                        {Array.isArray(msg.message)
                          ? msg.message.map((m, i) => <span key={`${key}-part-${i}`}>{m}</span>)
                          : msg.message}
                        <div className="small mt-1 text-muted">
                          {moment.utc(msg.sent_at).local().fromNow()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-top">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message"
                />
                <button className="btn btn-primary" onClick={sendMessage}>
                  Send
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}