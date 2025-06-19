import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import "../css/pin.css";

function Index() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState(""); // เพิ่ม state สำหรับ PIN

  const handleJoin = (e) => {
    e.preventDefault();

    if (!username.trim() || !pin.trim()) {
      alert("กรุณากรอกชื่อและ PIN");
      return;
    }

    navigate("/select", { state: { username, pin } }); // ส่งข้อมูลไปยังหน้า /select
  };

  return (
    <>
      <Helmet>
        <title>Index</title>
      </Helmet>

      <div className="content">
        <div className="logo">
          <h1>Sociometry</h1>
        </div>

        <div className="join">
          <form onSubmit={handleJoin}>
            <input 
              type="text" 
              placeholder="Enter your name" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />

            <input 
              type="text" 
              placeholder="Enter PIN" 
              value={pin} 
              onChange={(e) => setPin(e.target.value)} 
            />

            <button type="submit">JOIN</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Index;
