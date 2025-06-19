import React, { useState, useEffect, useRef } from "react";
import "../css/sociogram.css";

function Sociogram() {
  const svgRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [shapes, setShapes] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedTab, setSelectedTab] = useState(1);
  const [data, setData] = useState({ shapeData: {}, levels: {}, personScores: {}, groups: [], mutualFirstFirst: [], mutualSecondSecond: [], mutualMixed: [] });





    useEffect(() => {
        const fetchData = async () => {
            try {
                let response = await fetch("http://localhost:4000/api/social"); // ✅ แก้ไข URL API
                let result = await response.json();
                console.log("API Response:", result);
                setData(result);
            } catch (error) {
                console.error("Error fetching social data:", error);
            }
        };
        fetchData();
    }, []);
    console.log(data.shapeData);
    

  useEffect(() => {
    function updateCanvasSize() {
      const size = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.9);
      setCanvasSize({ width: size, height: size });
    }

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  const centerX = canvasSize.width / 2;
  const centerY = canvasSize.height / 2;
  const circleSizes = [0.1, 0.2, 0.35, 0.5].map((size) => size * canvasSize.width);

  const shapeData = data?.shapeData || []; // ✅ ป้องกัน error หาก data เป็น null


  useEffect(() => {
    if (!shapeData || Object.keys(shapeData).length === 0) return;
  
    const newShapes = Object.entries(shapeData).map(([name, [choice1, choice2, level]]) => {
      const levelIndex = parseInt(level) - 1;
      const minRadius = levelIndex === 0 ? 0 : circleSizes[levelIndex - 1] + 30;
      const maxRadius = circleSizes[levelIndex] - 30;
  
      let x, y;
      do {
        const distanceFromCenter = Math.random() * (maxRadius - minRadius) + minRadius;
        const angle = Math.random() * Math.PI * 2;
        x = centerX + distanceFromCenter * Math.cos(angle);
        y = centerY + distanceFromCenter * Math.sin(angle);
      } while (false); // ❌ ลูปนี้ไม่มีประโยชน์ แนะนำให้ลบออก
  
      return {
        id: name,
        type: "square",
        x,
        y,
        width: 50,
        height: 30,
        name,
        choice1,
        choice2,
        level: levelIndex,
      };
    });
  
    setShapes(newShapes);
  }, [canvasSize, data.shapeData]);
  

  const totalTabs = 4;
  const membersPerTab = Math.ceil(shapes.length / totalTabs);
  const displayedShapes = shapes.slice((selectedTab - 1) * membersPerTab, selectedTab * membersPerTab);

  function getArrowPosition(shape1, shape2, isPrimary) {
    // หาความแตกต่างของพิกัด x และ y ระหว่าง shape2 กับ shape1
    // (dx, dy)
    const dx = shape2.x - shape1.x;
    const dy = shape2.y - shape1.y;
  
    // คำนวณมุม (angle) ระหว่างรูปทรงทั้งสอง จากจุดศูนย์กลางของสี่เหลี่ยม
    // ใช้ atan2(dy, dx) ซึ่งจะให้ค่ามุมเป็นเรเดียนในช่วง -π ถึง π
    const angle = Math.atan2(dy, dx);
  
    // กำหนดระยะ offset สำหรับเลื่อนปลายเส้นออกจากขอบสี่เหลี่ยม
    const arrowOffset = 10;
  
    // ฟังก์ชันย่อย getEdgePoint สำหรับคำนวณจุดขอบ (edge) ของสี่เหลี่ยม
    // ในทิศทางของมุม (angle) ที่กำหนด
    const getEdgePoint = (shape, angle) => {
      // ครึ่งหนึ่งของความกว้าง (width) และครึ่งหนึ่งของความสูง (height)
      const hw = shape.width / 2;
      const hh = shape.height / 2;
  
      return {
        // x:  จุดกึ่งกลางของ shape + direction ที่ขึ้นอยู่กับสัญลักษณ์ (sign)
        //      ของ cos(angle) คูณด้วยครึ่งความกว้าง + arrowOffset
        //      เพื่อเลื่อนไปขอบสี่เหลี่ยมพอดี (บวกเพิ่ม arrowOffset)
        x: shape.x + Math.sign(Math.cos(angle)) * hw + arrowOffset * Math.cos(angle),
  
        // y:  คล้ายกับ x แต่เปลี่ยนเป็น sin(angle) และใช้ครึ่งความสูง (hh)
        y: shape.y + Math.sign(Math.sin(angle)) * hh + arrowOffset * Math.sin(angle),
      };
    };
  
    return {
      // จุดเริ่มต้นของเส้น จะเป็นขอบของ shape1 ในทิศ angle
      start: getEdgePoint(shape1, angle),
      // จุดสิ้นสุดของเส้น จะเป็นขอบของ shape2 ในทิศตรงข้าม (angle + π)
      end: getEdgePoint(shape2, angle + Math.PI),
    };
  }
  

  function handleMouseDown(event, shapeId) {
    const shape = shapes.find((s) => s.id === shapeId); // ค้นหารูปทรงที่ถูกคลิก
    if (shape) {
        setDragging(shapeId); // ตั้งค่ารูปทรงที่กำลังถูกลาก
        setOffset({ x: event.clientX - shape.x, y: event.clientY - shape.y }); // คำนวณ offset เพื่อป้องกันการขยับผิดพิกัด
    }
}


  function handleMouseMove(event) {
    // ถ้าไม่มีรูปทรง (shape) ที่กำลังถูกลากอยู่ (dragging === null หรือ undefined)
    // ให้ return ออกทันที เพราะไม่ต้องทำอะไร
    if (!dragging) return;
  
    // ถ้ามีรูปทรงถูกลาก ให้ปรับค่า shapes ด้วยการเรียก setShapes
    setShapes((prevShapes) =>
      prevShapes.map((shape) => {
        // ถ้ารูปทรงในลูปไม่ใช่ตัวที่กำลังถูกลากอยู่
        // ก็ไม่ต้องเปลี่ยนแปลงตำแหน่ง (return shape เดิม)
        if (shape.id !== dragging) return shape;
  
        // คำนวณตำแหน่งใหม่ของรูปทรง โดยอ้างอิง event.clientX, event.clientY (ตำแหน่งเมาส์)
        // ลบด้วย offset.x, offset.y ที่บันทึกไว้ตอนเริ่มคลิกลาก (mousedown)
        // เพื่อให้รูปทรงขยับตามเมาส์อย่างต่อเนื่อง (ไม่กระโดด)
        const mouseX = event.clientX - offset.x;
        const mouseY = event.clientY - offset.y;
  
        // หาระยะทางจากจุดศูนย์กลาง (centerX, centerY) ไปยังตำแหน่งเป้าหมายที่เมาส์ลากอยู่
        const distance = Math.sqrt((mouseX - centerX) ** 2 + (mouseY - centerY) ** 2);
  
        // หาค่ารัศมีต่ำสุดและสูงสุดของวงกลม “ชั้น” ของรูปทรงนั้น ๆ
        // level === 0 หมายถึงชั้นแรกในโค้ดนี้ จึงไม่มี minRadius (เป็นศูนย์ได้)
        // ถ้า level > 0 ก็จะเพิ่มระยะห่าง +30 เพื่อไม่ให้ตัวสี่เหลี่ยมชนขอบ
        const minRadius = shape.level === 0 ? 0 : circleSizes[shape.level - 1] + 30;
        const maxRadius = circleSizes[shape.level] - 30;
  
        // ถ้าระยะห่าง distance จากจุดศูนย์กลางอยู่ในช่วง minRadius ถึง maxRadius
        // แสดงว่าสามารถลากอยู่ในชั้นวงกลมได้ จึงอัปเดตตำแหน่ง (x, y)
        if (distance >= minRadius && distance <= maxRadius) {
          return { ...shape, x: mouseX, y: mouseY };
        }
  
        // ถ้าเกินขอบเขตชั้นของตนเอง จะไม่อัปเดตตำแหน่ง (return shape เดิม)
        return shape;
      })
    );
  }
  

  function handleMouseUp() {
    setDragging(null);
  }

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  return (
    
    <div style={{ display: "flex", height: "90vh", width: "100vw" }}>
      {/* กราฟด้านซ้าย */}
      <div style={{ flex: "2", display: "flex", justifyContent: "center", alignItems: "center", borderRight: "2px solid gray" }}>
        <svg ref={svgRef} width={canvasSize.width} height={canvasSize.height} style={{ border: "1px solid black" }}>
          {circleSizes.map((size, i) => (
            <circle key={i} cx={centerX} cy={centerY} r={size} fill="none" stroke="gray" strokeWidth="1" />
          ))}

          {/* วาดเส้นเชื่อมแบบไม่มีหัวลูกศร */}
          {shapes.flatMap((shape1) =>
            shapes.map((shape2) => {
              if (shape1.choice1 === shape2.name || shape1.choice2 === shape2.name) {
                const isPrimary = shape1.choice1 === shape2.name;
                const { start, end } = getArrowPosition(shape1, shape2, isPrimary);
                const strokeDasharray = isPrimary ? "none" : "5,5";

                return (
                  <g key={`${shape1.id}-${shape2.id}-${isPrimary ? "primary" : "secondary"}`}>
                    <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="black" strokeWidth="2" strokeDasharray={strokeDasharray} />
                    <circle cx={end.x} cy={end.y} r="5" fill="black" />
                  </g>
                );
              }
              return null;
            })
          )}

          {/* วาดรูปทรง */}
          {shapes.map((shape) => (
            <g key={shape.id} onMouseDown={(e) => handleMouseDown(e, shape.id)} style={{ cursor: "grab" }}>
              <rect x={shape.x - shape.width / 2} y={shape.y - shape.height / 2} width={shape.width} height={shape.height} fill="blue" />
              <text x={shape.x} y={shape.y} textAnchor="middle" alignmentBaseline="middle" fill="white" fontSize="14px">
                {shape.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* พื้นที่ด้านขวาที่เปลี่ยนได้ตามแท็บ */}
      <div style={{ flex: "1", padding: "20px", backgroundColor: "#f8f9fa", display: "flex", flexDirection: "column" }}>
        <h2 style={{ textAlign: "center", borderBottom: "2px solid gray", paddingBottom: "10px" }}>ข้อมูล</h2>
        
        {/* ปุ่มเลือกแท็บ */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "10px" }}>
          {Array.from({ length: totalTabs }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setSelectedTab(i + 1)}
              style={{
                padding: "5px 10px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                backgroundColor: selectedTab === i + 1 ? "#007bff" : "#e0e0e0",
                color: selectedTab === i + 1 ? "white" : "black",
                fontSize: "16px",
              }}
            >
              หน้า {i + 1}
            </button>
          ))}
        </div>

        {/* แสดงเนื้อหาตามแท็บ */}
        <div style={{ flexGrow: 1, overflowY: "auto", padding: "10px", border: "1px solid lightgray", backgroundColor: "white" }}>
          {selectedTab === 1 && (
            <>
              <h3>📌 สมาชิก และคะแนน</h3>
              <table border="1">
                  <thead>
                      <tr>
                          <th>ชื่อ</th>
                          <th>คะแนนรวม</th>
                          <th>ระดับ</th>
                          
                      </tr>
                  </thead>
                  <tbody>
                      {Object.keys(data.levels || {}).map((person) => (
                          <tr key={person}>
                              <td>{person}</td>
                              <td>{data.personScores?.[person] ?? 0}</td>
                              <td>{data.levels[person]}</td>

                          </tr>
                      ))}
                  </tbody>
              </table>


            </>
          )}

          

          {selectedTab === 2 && (
            <>
            <h3>🔄 Mutual Choices</h3>

              <h4>🟢 Mutual First-First (เลือกกันเป็นอันดับ 1)</h4>
              <ul>
                  {data.mutualFirstFirst?.length ? (
                      data.mutualFirstFirst.map(({ person, selectedPerson }, index) => (
                          <li key={index}>{person} selected {selectedPerson} as 1st choice and {selectedPerson} selected {person} as 1st choice</li>
                      ))
                  ) : (
                      <p>ไม่มีข้อมูล</p>
                  )}
              </ul>

              <h4>🔵 Mutual Second-Second (เลือกกันเป็นอันดับ 2)</h4>
              <ul>
                  {data.mutualSecondSecond?.length ? (
                      data.mutualSecondSecond.map(({ person, selectedPerson }, index) => (
                          <li key={index}>{person} and {selectedPerson} selected each other as 2nd choice</li>
                      ))
                  ) : (
                      <p>ไม่มีข้อมูล</p>
                  )}
              </ul>

              <h4>🟡 Mutual Mixed (เลือกกันต่างอันดับ)</h4>
              <ul>
                  {data.mutualMixed?.length ? (
                      data.mutualMixed.map(({ person, selectedPerson }, index) => (
                          <li key={index}>{person} selected {selectedPerson} as 2nd choice and {selectedPerson} selected {person} as 1st choice</li>
                      ))
                  ) : (
                      <p>ไม่มีข้อมูล</p>
                  )}
              </ul>
            </>
          )}

          {selectedTab === 3 && (
            <>
              <h3>📌 กลุ่ม</h3>
            <h3>📌 Groups</h3>
            <ul>
                {data.groups?.length ? (
                    data.groups.map((group, index) => <li key={index}>{group.join(", ")}</li>)
                ) : (
                    <p>ไม่มีข้อมูล</p>
                )}
            </ul>
            </>
          )}
          {selectedTab === 4 && (
            <>

              {/* ตรวจสอบว่าข้อมูลพร้อมหรือยัง */}
              {data?.star ? (
  <p>
    คนที่เป็น star คือ:&nbsp;
    <strong>{data.star}</strong>
  </p>
) : (
  <p>คนที่เป็น star คือ: <strong>ไม่มี</strong></p>
)}

{ /* กรณีเป็น Array ต้องเช็กว่ามี length > 0 หรือไม่ */ }
{data?.rejectees && data.rejectees.length > 0 ? (
  <p>
    คนที่เป็น rejectees คือ:&nbsp;
    <strong>{data.rejectees.join(", ")}</strong>
  </p>
) : (
  <p>คนที่เป็น rejectees คือ: <strong>ไม่มี</strong></p>
)}

{data?.neglectees && data.neglectees.length > 0 ? (
  <p>
    คนที่เป็น neglectees คือ:&nbsp;
    <strong>{data.neglectees.join(", ")}</strong>
  </p>
) : (
  <p>คนที่เป็น neglectees คือ: <strong>ไม่มี</strong></p>
)}


            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default Sociogram;
