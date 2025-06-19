import React, { useEffect, useState } from "react";

const SocialData = () => {
    const [data, setData] = useState(null);
    const [calculatedScores, setCalculatedScores] = useState({});

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



    if (!data) return <p>Loading...</p>;

    return (
        <div>
            <h1>📊 Social Data Overview</h1>
            <h2>⭐ Star: {data.star || "ไม่มีข้อมูล"}</h2>

            <h3>📌 คะแนนที่ใช้คำนวณ</h3>
            <p>🏅 คะแนนอันดับ 1: {calculatedScores.score_first || "N/A"}</p>
            <p>🥈 คะแนนอันดับ 2: {calculatedScores.score_second || "N/A"}</p>

            <h3>📌 ระดับสมาชิก</h3>
            <table border="1">
                <thead>
                    <tr>
                        <th>ชื่อ</th>
                        <th>ระดับ</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(data.levels || {}).map(([person, level]) => (
                        <tr key={person}>
                            <td>{person}</td>
                            <td>{level}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3>📌 คะแนนของแต่ละคน</h3>
            <table border="1">
                <thead>
                    <tr>
                        <th>ชื่อ</th>
                        <th>คะแนนรวม</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(data.personScores || {}).map(([person, score]) => (
                        <tr key={person}>
                            <td>{person}</td>
                            <td>{score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3>🚫 Rejectees (ไม่ถูกเลือกเลย)</h3>
            <ul>
                {data.rejectees?.length ? (
                    data.rejectees.map(person => <li key={person}>{person}</li>)
                ) : (
                    <p>ไม่มีข้อมูล</p>
                )}
            </ul>

            <h3>📌 Groups</h3>
            <ul>
                {data.groups?.length ? (
                    data.groups.map((group, index) => <li key={index}>{group.join(", ")}</li>)
                ) : (
                    <p>ไม่มีข้อมูล</p>
                )}
            </ul>

            {/* ✅ เพิ่มส่วนแสดง Mutual Choice พร้อมข้อความอธิบาย */}
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

        </div>
    );
};

export default SocialData;
