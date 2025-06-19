import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import './css/App.css';
import Home from "./pages/home";
import Pin from "./pages/pin";
import Costome from "./pages/costome";
import Select from "./pages/select";
import Room_create from "./pages/room_create";
import Sociogram from "./pages/sociogram";
import CalcuData from "./pages/calcuData";
import Login from "./pages/login";
import Register from "./pages/register";

function App() {


  return (
    <>
    
      <div className="container">    
        <Pin /> 
        <Costome />
      </div>
      
    </>
  );
}


// ใช้ Routes สำหรับกำหนดเส้นทาง
function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/select" element={<Select />} />
        <Route path="/Room_create" element={<Room_create />} />
        <Route path="/sociogram" element={<Sociogram />} />
        <Route path="/calcuData" element={<CalcuData />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default AppWrapper;
