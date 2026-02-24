import { useState, useEffect } from "react";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import { Link, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import moment from "moment";

export default function MessageDetail() {

  const baseURL = "/talkio";
  const { id } = useParams();

  const token = localStorage.getItem(ACCESS_TOKEN);
  const decoded = token ? jwtDecode(token) : null;
  const user_id = decoded?.user_id;

  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState([]);
  const [profile, setProfile] = useState({});
  const [myProfile, setMyProfile] = useState({});
  const [newMessage, setNewMessage] = useState("");


  useEffect(() => {
    if (!user_id) return;

    api.get(`${baseURL}/profile/${user_id}/`)
      .then(res => setMyProfile(res.data))
      .catch(err => console.log(err));
  }, [user_id]);

  
  useEffect(() => {
    if (!user_id) return;

    api.get(`${baseURL}/my-messages/${user_id}/`)
      .then(res => setMessages(res.data))
      .catch(err => console.log(err));
  }, [user_id]);


  useEffect(() => {
    if (!user_id || !id) return;

    const interval = setInterval(() => {
      api.get(`${baseURL}/get-messages/${user_id}/${id}/`)
        .then(res => setConversation(res.data))
        .catch(err => console.log(err));
    }, 3000);

    return () => clearInterval(interval);

  }, [user_id, id]);

  
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
      .then(() => {
        setNewMessage("");
      })
      .catch(err => console.log(err));
  };

  return (
    <main className="content" style={{ marginTop: "120px" }}>
      <div className="container">
        <div className="row">

          {/* LEFT SIDEBAR */}
          <div className="col-md-4 border-end">

            {/* Logged in user profile */}
            <div className="text-center p-3 border-bottom">
              <img
                src={myProfile.image}
                className="rounded-circle"
                width="60"
                height="60"
                alt="profile"
              />
              <h6 className="mt-2">{myProfile.full_name}</h6>
              <small>@{decoded?.username}</small>
            </div>

            {/* Inbox list */}
            {messages.map(msg => (
              <Link
                key={msg.id}
                to={`/inbox/${msg.sender.id === user_id ? msg.receiver.id : msg.sender.id}`}
                className="list-group-item list-group-item-action"
              >
                {msg.message}
              </Link>
            ))}

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
                conversation.map((msg, index) => (
                  <div
                    key={index}
                    className={msg.sender.id === user_id ? "text-end" : "text-start"}
                  >
                    <div className="bg-light p-2 rounded m-2 d-inline-block">
                      {msg.message}
                      <div className="small text-muted">
                        {moment.utc(msg.sent_at).local().fromNow()}
                      </div>
                    </div>
                  </div>
                ))
              )}

            </div>

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