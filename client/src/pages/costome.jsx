import React, { useState, useRef, useEffect } from "react";
import "../css/costome.css";
function Costome() {
  const [activeTab, setActiveTab] = useState("character");
  const [isEditVisible, setIsEditVisible] = useState(false);
  const editRef = useRef(null); // อ้างอิงถึง div.cos-edit
  const buttonRef = useRef(null); // อ้างอิงถึง btn-edit

  const toggleEditVisibility = () => {
    setIsEditVisible(!isEditVisible);
  };

  const handleClickOutside = (event) => {
    // หากคลิกนอก div.cos-edit และปุ่ม btn-edit ให้ปิด cos-edit
    if (
      editRef.current &&
      !editRef.current.contains(event.target) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target)
    ) {
      setIsEditVisible(false);
    }
  };

  useEffect(() => {
    // เพิ่ม event listener เพื่อฟังการคลิก
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // ลบ event listener เมื่อ component ถูก unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="costume">
        <button
          ref={buttonRef}
          className="btn-edit"
          onClick={toggleEditVisibility}
        >
          edit
        </button>
      </div>

      {/* Toggle cos-edit */}
      <div
        ref={editRef}
        className={`cos-edit ${isEditVisible ? "edit-active" : ""}`}
      >
        <div className="button">
          <button
            className="btn-cha"
            onClick={() => setActiveTab("character")}
          >
            Character
          </button>
          <button
            className="btn-acces"
            onClick={() => setActiveTab("accessories")}
          >
            Accessories
          </button>
        </div>

        {/* Tab: Character */}
        <div
          className={`list character ${
            activeTab === "character" ? "active" : ""
          }`}
        >
          {Array.from({ length: 20 }, (_, i) => (
            <div className="List" key={i}>
              Character {i + 1}
            </div>
          ))}
        </div>

        {/* Tab: Accessories */}
        <div
          className={`list accessories ${
            activeTab === "accessories" ? "active" : ""
          }`}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <div className="List" key={i}>
              Accessory {i + 1}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Costome;
