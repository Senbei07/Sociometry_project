import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import "../css/select.css";

const socket = io("http://localhost:4000"); // เชื่อมต่อเซิร์ฟเวอร์

function Select() {
    const location = useLocation();
    const { username, pin } = location.state || {}; // รับค่าจากหน้า index

    const [listItems, setListItems] = useState([]);
    const [fristItem, setFristItem] = useState(null);
    const [secondItem, setSecondItem] = useState(null);

    useEffect(() => {
        if (!username || !pin) {
            return;
        }
    
        console.log(`🔵 Joining room: ${pin} as ${username}`);
        
        socket.emit("joinRoom", pin, username);
    
        socket.on("updateUsers", (users) => {
            console.log(`👥 Received updated users in room ${pin}:`, users);
            setListItems(users.map((user) => ({
                id: user.id,
                name: user.name,
                used: false,
            })));
        });
    
        return () => {
            console.log(`🔴 Leaving room: ${pin}`);
            socket.emit("leaveRoom", pin);
            socket.off("updateUsers");
        };
    }, [username, pin]);

    
    
    const onDragStart = (e, item, origin) => {
        e.dataTransfer.setData("item", JSON.stringify(item));
        e.dataTransfer.setData("origin", origin);
    };

    const onDrop = (e, target) => {
        e.preventDefault();
        const item = JSON.parse(e.dataTransfer.getData("item"));
        const origin = e.dataTransfer.getData("origin");

        if (origin === "frist" && target === "second") {
            setSecondItem(item);
            setFristItem(secondItem);
            return;
        }

        if (origin === "second" && target === "frist") {
            setFristItem(item);
            setSecondItem(fristItem);
            return;
        }

        if (target === "frist") {
            if (fristItem) {
                setListItems((prev) =>
                    prev.map((i) => (i.id === fristItem.id ? { ...i, used: false } : i))
                );
            }
            setFristItem(item);
        }

        if (target === "second") {
            if (secondItem) {
                setListItems((prev) =>
                    prev.map((i) => (i.id === secondItem.id ? { ...i, used: false } : i))
                );
            }
            setSecondItem(item);
        }

        setListItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, used: true } : i))
        );
    };

    const allowDrop = (e) => e.preventDefault();

    const isDraggable = (item) => !(fristItem?.id === item.id || secondItem?.id === item.id);

    // ✅ ฟังก์ชันส่งข้อมูลไปยังเซิร์ฟเวอร์
    const handleSubmit = (event) => {
        event.preventDefault(); // ป้องกันการรีโหลดหน้าเว็บ
    
        if (!fristItem || !secondItem) {
            alert("กรุณาเลือกทั้งสองคนก่อนกดส่ง!");
            return;
        }
    
        const selectedData = {
            username,
            pin,
            choice1: fristItem.name,
            choice2: secondItem.name,
        };
    
        console.log("📤 Sending data:", selectedData);
    
        // ส่งข้อมูลไปยัง API (ในกรณีที่รองรับ RESTful)
        fetch("/api/select_submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedData),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("✅ บันทึกข้อมูลเรียบร้อยแล้ว!");
                } else {
                    alert("❌ เกิดข้อผิดพลาด: " + data.message);
                }
            })
            .catch(err => {
                console.error("❌ Error submitting selection:", err);
                alert("❌ ไม่สามารถส่งข้อมูลได้ กรุณาลองอีกครั้ง");
            });
    
        // ส่งข้อมูลผ่าน WebSocket
        socket.emit("submitSelection", selectedData, (response) => {
            if (response && response.success) {
                alert("✅ บันทึกข้อมูลเรียบร้อยแล้ว!");
            } else {
                alert("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล!");
            }
        });
    };
    

    return (
        <div className="select-con">
            <h2>Room PIN: {pin}</h2>

            <div className="select">
                <div className="me">{username}</div>

                <div className="frist" onDrop={(e) => onDrop(e, "frist")} onDragOver={allowDrop}>
                    {fristItem && (
                        <div draggable className="List" onDragStart={(e) => onDragStart(e, fristItem, "frist")}>
                            {fristItem.name}
                        </div>
                    )}
                </div>

                <div className="second" onDrop={(e) => onDrop(e, "second")} onDragOver={allowDrop}>
                    {secondItem && (
                        <div draggable className="List" onDragStart={(e) => onDragStart(e, secondItem, "second")}>
                            {secondItem.name}
                        </div>
                    )}
                </div>
            </div>

            <div className="popu">
                {listItems.map((item) => (
                    <div
                        key={item.id}
                        draggable={isDraggable(item)}
                        onDragStart={(e) => isDraggable(item) && onDragStart(e, item, "list")}
                        className={`List ${item.used ? "disabled" : ""}`}
                    >
                        {item.name}
                    </div>
                ))}
            </div>

            {/* ✅ ปุ่มส่งข้อมูล */}
            <button className="submit-btn" onClick={handleSubmit}>
                ส่ง
            </button>
        </div>
    );
}

export default Select;
