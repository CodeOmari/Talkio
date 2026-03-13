import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function SearchUsers() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const searchUser = async () => {
    if (!username.trim()) return;

    try {
      // Make sure the API call includes /talkio if needed
      const response = await api.get(`/talkio/search/${username}/`);

      if (response.data.length === 0) {
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
        title: "Search failed",
        text: "Check console for details",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="p-4">
      <input
        type="text"
        className="form-control"
        placeholder="Search by username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button className="btn btn-primary mt-2" onClick={searchUser}>
        Search
      </button>
    </div>
  );
}