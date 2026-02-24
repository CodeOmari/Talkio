import React, { useState, useEffect } from "react";
import "../styles/Message.css";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import {jwtDecode} from "jwt-decode";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Message() {
  const baseURL = "http://127.0.0.1:8000/talkio";
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [myProfile, setMyProfile] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem(ACCESS_TOKEN);
  let user_id = null;
  let decoded = null;

  if (token) {
    decoded = jwtDecode(token);
    user_id = decoded.user_id;
  }

  
  useEffect(() => {
    if (!user_id) return;

    api
      .get(`${baseURL}/profile/${user_id}/`)
      .then((res) => setMyProfile(res.data))
      .catch(console.error);
  }, [user_id]);

  
  useEffect(() => {
    if (!user_id) return;

    api
      .get(`${baseURL}/my-messages/${user_id}/`)
      .then((res) => setMessages(res.data))
      .catch((error) => {
        console.error(error);
        Swal.fire({
          title: "Error loading messages",
          icon: "error",
        });
      });
  }, [user_id]);

  
  const searchUser = async () => {
    if (!username.trim()) return;

    try {
      const response = await api.get(`${baseURL}/search/${username}/`);

      if (!response.data || response.data.length === 0) {
        Swal.fire({
          title: "User Not Found",
          icon: "warning",
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      }

  
      const userId = response.data[0].user.id;
      navigate(`/inbox/${userId}`);
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Search Failed",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  return (
    <main className="content" style={{ marginTop: "120px" }}>
      <div className="container">
        <h1>Messages</h1>
        <div className="card">
          <div className="row">

            {/* LEFT SIDEBAR */}
            <div className="col-12 col-lg-5 border-end p-3">

              {/* Logged-in user profile */}
              {myProfile && (
                <div className="text-center mb-3">
                  <img
                    src={myProfile.image}
                    className="rounded-circle"
                    width="60"
                    height="60"
                    alt="Profile"
                  />
                  <h6 className="mt-2">
                    Welcome Back, {myProfile.full_name}
                  </h6>
                </div>
              )}

              {/* Search Input */}
              <div className="d-flex mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <button
                  className="btn btn-primary ms-2"
                  onClick={searchUser}
                >
                  Search
                </button>
              </div>

              {/* Inbox List */}
              {messages.length === 0 ? (
                <div className="text-center mt-5">
                  <p>No conversations yet</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const otherUserId =
                    msg.sender.id === user_id ? msg.receiver.id : msg.sender.id;
                  const profile =
                    msg.sender.id === user_id
                      ? msg.receiver_profile
                      : msg.sender_profile;

                  return (
                    <Link
                      key={msg.id}
                      to={`/inbox/${otherUserId}`}
                      className="list-group-item list-group-item-action mb-2"
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={profile.image}
                          className="rounded-circle me-2"
                          width={40}
                          height={40}
                          alt="Profile"
                        />
                        <div className="flex-grow-1">
                          <strong>{profile.full_name || profile.user.username}</strong>
                          <div className="small text-truncate">{msg.message}</div>
                        </div>
                        <small className="text-muted ms-2">
                          {moment.utc(msg.sent_at).local().fromNow()}
                        </small>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="col-12 col-lg-7 p-3">
              <div className="text-center text-muted">
                <p>Select a conversation or search for a user to start messaging.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}