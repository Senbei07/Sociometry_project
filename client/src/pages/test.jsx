import React, { useState, useEffect, useRef } from "react";

function Sociogram() {
  const svgRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [shapes, setShapes] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedTab, setSelectedTab] = useState(1);

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

  const shapeData = {
    a: ["c", "h", "1"],
    b: ["f", "l", "3"],
    c: ["l", "j", "2"],
    d: ["f", "r", "2"],
    f: ["o", "a", "3"],
    g: ["b", "j", "4"],
    h: ["q", "d", "4"],
    j: ["g", "b", "3"],
    l: ["m", "g", "4"],
    m: ["r", "l", "4"],
    o: ["t", "h", "3"],
    q: ["t", "y", "2"],
    r: ["b", "m", "4"],
    t: ["l", "c", "3"],
    y: ["d", "q", "4"],
  };

  useEffect(() => {
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
      } while (false);

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
  }, [canvasSize]);

  const totalTabs = 4;
  const membersPerTab = Math.ceil(shapes.length / totalTabs);
  const displayedShapes = shapes.slice((selectedTab - 1) * membersPerTab, selectedTab * membersPerTab);

  return (
    <div style={{ display: "flex", height: "90vh", width: "100vw" }}>
      {/* กราฟด้านซ้าย */}
      <div style={{ flex: "2", display: "flex", justifyContent: "center", alignItems: "center", borderRight: "2px solid gray" }}>
        <svg ref={svgRef} width={canvasSize.width} height={canvasSize.height} style={{ border: "1px solid black" }}>
          {circleSizes.map((size, i) => (
            <circle key={i} cx={centerX} cy={centerY} r={size} fill="none" stroke="gray" strokeWidth="1" />
          ))}

          {/* วาดรูปทรง */}
          {shapes.map((shape) => (
            <g key={shape.id} style={{ cursor: "grab" }}>
              <rect x={shape.x - shape.width / 2} y={shape.y - shape.height / 2} width={shape.width} height={shape.height} fill="blue" />
              <text x={shape.x} y={shape.y} textAnchor="middle" alignmentBaseline="middle" fill="white" fontSize="14px">
                {shape.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* รายชื่อสมาชิกด้านขวา */}
      <div style={{ flex: "1", padding: "20px", backgroundColor: "#f8f9fa", display: "flex", flexDirection: "column" }}>
        <h2 style={{ textAlign: "center", borderBottom: "2px solid gray", paddingBottom: "10px" }}>สมาชิก</h2>
        
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

        {/* แสดงรายการสมาชิกของแท็บที่เลือก */}
        <ul style={{ listStyleType: "none", padding: 0, flexGrow: 1, overflowY: "auto" }}>
          {displayedShapes.map((shape) => (
            <li key={shape.id} style={{ padding: "10px", borderBottom: "1px solid lightgray", fontSize: "16px" }}>
              {shape.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Sociogram;
