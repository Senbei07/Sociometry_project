import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Register = () => {
  const [title, setTitle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:4000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, firstName, lastName, gender, phone, email, password }),
    });

    const data = await response.json();
    if (data.success) {
      alert("User registered successfully");
      navigate("/login"); // ไปที่หน้า Login หลังจากสมัครสมาชิกสำเร็จ
    } else {
      alert("Registration Failed: " + data.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">คำนำหน้า</label>
            <select className="form-select" value={title} onChange={(e) => setTitle(e.target.value)} required>
              <option value="">เลือกคำนำหน้า</option>
              <option value="1">นาย</option>
              <option value="2">นางสาว</option>
              <option value="3">นาง</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">ชื่อ</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="ชื่อ" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">นามสกุล</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="นามสกุล" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">เพศ</label>
            <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)} required>
              <option value="">เลือกเพศ</option>
              <option value="1">ชาย</option>
              <option value="2">หญิง</option>
              <option value="3">อื่น ๆ</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">เบอร์โทร</label>
            <input 
              type="tel" 
              className="form-control" 
              placeholder="เบอร์โทร" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
