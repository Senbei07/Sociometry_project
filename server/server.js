import express from "express";
import session from "express-session";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dbConnection from "./config.js"; 
import bcrypt from "bcrypt";
import sharedSession from "express-socket.io-session";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// ✅ กำหนด sessionMiddleware ก่อน
const sessionMiddleware = session({
  secret: 'mySuperSecretKey123$%^',
  resave: false,
  saveUninitialized: true,
});

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

// ✅ ใช้ sessionMiddleware ก่อน `io.use(sharedSession(...))`
app.use(sessionMiddleware);
io.use(sharedSession(sessionMiddleware, { autoSave: true })); 

// ✅ API ทดสอบ
app.get("/api", (req, res) => {
  res.json({ message: "Hello from Back-End!" });
});

app.get("/api/home", (req, res) => {
  res.json({ message: "This is the home API" });
});

// ✅ ระบบล็อกอิน
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await dbConnection.execute(
      "SELECT log_id, log_username, log_password FROM login WHERE log_username = ? LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, users[0].log_password);
    if (!validPassword) {
      return res.status(400).json({ success: false, message: "Incorrect password" });
    }

    req.session.isLoggedIn = true;
    req.session.user = {
      id: users[0].log_id,
      username: users[0].log_username
    };

    res.status(200).json({ success: true, message: "Login successful", user: req.session.user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// ✅ API ตรวจสอบ session
app.get("/api/session", (req, res) => {
  if (req.session.isLoggedIn) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// ✅ API ออกจากระบบ
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// ✅ API สมัครสมาชิก
app.post("/api/register", async (req, res) => {
  const { email, password, title, firstName, lastName, gender, phone } = req.body;

  try {
    const [existingUser] = await dbConnection.execute("SELECT * FROM login WHERE log_username = ?", [email]);

    if (existingUser.length > 0) {
      return res.json({ success: false, message: "Email already exists" });
    }

    // ✅ เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ เพิ่มข้อมูลในฐานข้อมูล
    const [loginResult] = await dbConnection.execute(
      "INSERT INTO login (log_username, log_password, ro_id) VALUES (?, ?, ?)",
      [email, hashedPassword, 2]
    );

    const logId = loginResult.insertId;

    await dbConnection.execute(
      "INSERT INTO `user`(`log_id`, `title_id`, `u_name`, `u_surname`, `gen_id`, `u_tel`, `u_date`) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [logId, title, firstName, lastName, gender, phone]
    );

    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

//group
app.get("/api/groups", async (req, res) => {
  try {
      // ✅ ดึงข้อมูลกลุ่มทั้งหมด พร้อมชื่อเจ้าของห้อง (ใช้ LEFT JOIN เผื่อกรณี user ไม่มีใน table user)
      const [groups] = await dbConnection.execute(`
          SELECT g.group_id, g.group_name, g.group_pin, g.group_question, g.group_quantity, g.theme_id,
                 COALESCE(u.u_name, 'Unknown') AS owner_name
          FROM groups g
          LEFT JOIN user u ON g.u_id = u.log_id
      `);

      console.log("Fetched Groups:", groups); // ✅ ตรวจสอบค่าที่ดึงมา
      res.json({ success: true, groups });
  } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ success: false, message: "Database error" });
  }
});







//group create
async function generateUniquePIN() {
  let isUnique = false;
  let newPin;

  while (!isUnique) {
      newPin = Math.floor(100000 + Math.random() * 900000); // สุ่มตัวเลข 6 หลัก

      const [existingPins] = await dbConnection.execute(
          "SELECT COUNT(*) AS count FROM groups WHERE group_pin = ?",
          [newPin]
      );

      if (existingPins[0].count === 0) {
          isUnique = true;
      }
  }

  return newPin.toString();
}

app.get("/api/groups/:group_id", async (req, res) => {
  const { group_id } = req.params;

  try {
      // ✅ ดึงข้อมูลของกลุ่มที่ระบุ
      const [groupDetails] = await dbConnection.execute(
          `SELECT *
            FROM groups g
            JOIN user u ON g.u_id = u.log_id
            WHERE g.group_id = ?`, 
          [group_id]
      );

      if (groupDetails.length === 0) {
          return res.status(404).json({ success: false, message: "Group not found" });
      }

      res.json({ success: true, group: groupDetails[0] });
  } catch (error) {
      console.error("Error fetching group details:", error);
      res.status(500).json({ success: false, message: "Database error" });
  }
});



app.post("/api/groups", async (req, res) => {
  try {
      const { group_name, group_question, group_quantity, theme_id, } = req.body;

      if (!group_name || !group_question || !group_quantity || !theme_id ) {
          return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      // ✅ สุ่ม PIN 6 หลัก
      const group_pin = Math.floor(100000 + Math.random() * 900000).toString();

      // ✅ เพิ่มห้องใหม่ลงฐานข้อมูล
      const [result] = await dbConnection.execute(
          "INSERT INTO groups (u_id, group_name, group_pin, group_question, group_quantity, theme_id) VALUES (?, ?, ?, ?, ?, ?)",
          [2, group_name, group_pin, group_question, group_quantity, theme_id]
      );

      res.status(201).json({ 
          success: true, 
          message: "Group created successfully", 
          group_id: result.insertId, 
          group_pin 
      });

  } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ success: false, message: "Database error" });
  }
});




app.post("/api/select_submit", (req, res) => {
  const { username, pin, choice1, choice2 } = req.body;

  // ค้นหา ID ของ username
  db.query("SELECT mi_id FROM member_info WHERE mi_name = ?", [username], (err, result) => {
      if (err) return res.json({ success: false, message: "Database error" });

      if (result.length === 0) return res.json({ success: false, message: "User not found" });

      const mi_id = result[0].mi_id;

      // ค้นหา ID ของตัวเลือก
      db.query("SELECT mi_id FROM member_info WHERE mi_name IN (?, ?)", [choice1, choice2], (err, choices) => {
          if (err) return res.json({ success: false, message: "Database error" });

          if (choices.length < 2) return res.json({ success: false, message: "Choices not found" });

          const choice1_id = choices[0].mi_id;
          const choice2_id = choices[1].mi_id;

          // เพิ่มข้อมูลลงฐานข้อมูล
          db.query(
              "INSERT INTO member_selecter (mi_id, choice1, choice2) VALUES (?, ?, ?)",
              [mi_id, choice1_id, choice2_id],
              (err, result) => {
                  if (err) return res.json({ success: false, message: "Insert error" });

                  res.json({ success: true });
              }
          );
      });
  });
});



// ✅ API คำนวณ Social Data
app.get("/api/social", async (req, res) => {
  try {
    const [rows] = await dbConnection.execute(`
      SELECT 
        ms.mi_id, 
        mi.mi_name AS person_name, 
        mi1.mi_name AS choice1_name, 
        mi2.mi_name AS choice2_name
      FROM 
        member_selecter ms
      LEFT JOIN member_info mi ON ms.mi_id = mi.mi_id
      LEFT JOIN member_info mi1 ON ms.choice1 = mi1.mi_id
      LEFT JOIN member_info mi2 ON ms.choice2 = mi2.mi_id;
    `);

    let peopleChoices = {};
    let selectionCount = {};

    rows.forEach(row => {
      peopleChoices[row.person_name] = [row.choice1_name, row.choice2_name].filter(Boolean);
      selectionCount[row.person_name] = { first: 0, second: 0, total: 0 };
    });

    Object.values(peopleChoices).forEach(([choice1, choice2]) => {
      if (choice1) selectionCount[choice1].first++;
      if (choice2) selectionCount[choice2].second++;
    });

    Object.keys(selectionCount).forEach(person => {
      selectionCount[person].total = selectionCount[person].first + selectionCount[person].second;
    });

    let maxTotal = Math.max(...Object.values(selectionCount).map(p => p.total));
    let stars = Object.keys(selectionCount).filter(person => selectionCount[person].total === maxTotal);

    let star = stars.length > 1 
      ? stars.reduce((prev, curr) => (selectionCount[curr].first > selectionCount[prev].first ? curr : prev), stars[0])
      : stars[0];

    let levels = {};
    let sortedByTotal = Object.entries(selectionCount).sort((a, b) => b[1].total - a[1].total);
    let num_members = sortedByTotal.length;
    let pos_25 = parseInt(Math.ceil(0.25 * num_members), 10);
    let pos_50 = parseInt(Math.ceil(0.50 * num_members), 10);
    let pos_75 = parseInt(Math.ceil(0.75 * num_members), 10);
    





    let rejectees = [], neglectees = [];
    let neglecteeThreshold = 2;

    Object.entries(selectionCount).forEach(([person, scores]) => {
      if (scores.total === 0) rejectees.push(person);
      else if (scores.total > 0 && scores.total <= neglecteeThreshold) neglectees.push(person);
    });

    let noChoicesAndNoSelections = Object.keys(selectionCount).filter(
      person => (!peopleChoices[person] || peopleChoices[person].every(choice => choice === null)) && selectionCount[person].total === 0
    );

    let score_first = 1, score_second = 0, maxIterations = 100, iterations = 0;
    while (iterations < maxIterations) {
        score_second = score_first - 1;
        let sum_score = ((selectionCount[star]?.first ?? 0) * score_first) + ((selectionCount[star]?.second ?? 0) * score_second);
        if (sum_score > pos_75) break;
        score_first++;
        iterations++;
    }
    let personScores = {};

    // คำนวณคะแนนรวมของแต่ละคน
    Object.keys(selectionCount).forEach(person => {
        personScores[person] =
            (selectionCount[person]?.first ?? 0) * score_first +
            (selectionCount[person]?.second ?? 0) * score_second;
    });
    
    // กำหนดระดับให้แต่ละคน
    Object.entries(personScores).forEach(([person, scores]) => {
        levels[person] = scores >= pos_75 ? 1 :
                         scores >= pos_50 ? 2 :
                         scores >= pos_25 ? 3 : 4;
    });
    

    let uniqueGroups = {};

    const findPaths = (startPerson, currentPerson, path = [], visited = {}) => {
      path.push(currentPerson);
      visited[currentPerson] = true;

      for (let selectedPerson of peopleChoices[currentPerson] || []) {
        if (selectedPerson === startPerson && path.length >= 3) {
          let sortedPath = [...path].sort();
          let groupKey = sortedPath.join('-');
          if (!uniqueGroups[groupKey]) {
            uniqueGroups[groupKey] = sortedPath;
          }
        } else if (!visited[selectedPerson]) {
          findPaths(startPerson, selectedPerson, [...path], { ...visited });
        }
      }
    };

    let mutualFirstFirst = [], mutualSecondSecond = [], mutualMixed = [];
    let processedPairs = new Set();

    Object.keys(peopleChoices).forEach(person => {
      peopleChoices[person].forEach((selectedPerson, index) => {
        if (selectedPerson && peopleChoices[selectedPerson]?.includes(person)) {
          let pairKey = [person, selectedPerson].sort().join("-");

          if (!processedPairs.has(pairKey)) {
            processedPairs.add(pairKey);
            let selectedPersonIndex = peopleChoices[selectedPerson].indexOf(person);
            if (index === 0 && selectedPersonIndex === 0) mutualFirstFirst.push({ person, selectedPerson });
            else if (index === 1 && selectedPersonIndex === 1) mutualSecondSecond.push({ person, selectedPerson });
            else mutualMixed.push({ person, selectedPerson });
          }
        }
      });
    });

    Object.keys(peopleChoices).forEach(person => {
      findPaths(person, person);
    });

    const shapeData = rows.reduce((acc, row) => {
      acc[row.person_name] = [
        row.choice1_name,
        row.choice2_name,
        levels[row.person_name] ?? 1 // ถ้าไม่มีค่า ให้ใช้ค่า default เป็น 1
      ].filter(Boolean);
      return acc;
    }, {});

    res.json({
      selectionCount, star, levels, rejectees, neglectees, noChoicesAndNoSelections, 
      personScores,mutualFirstFirst, mutualSecondSecond, mutualMixed, groups: Object.values(uniqueGroups), shapeData
    });

  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Database error" });
  }
});


// ✅ เชื่อมต่อกับ Socket.IO
const usersInRooms = {}; // เก็บข้อมูลผู้ใช้แยกตาม roomId

io.on("connection", (socket) => {
  console.log(`🟢 New connection: ${socket.id}`);

  socket.on("joinRoom", (pin, username) => {
    socket.join(pin);
    console.log(`🔵 ${username} (ID: ${socket.id}) joined room ${pin}`);

    if (!usersInRooms[pin]) {
        usersInRooms[pin] = [];
    }

    // ค้นหาว่ามีผู้ใช้เดิมที่ใช้ username เดียวกันอยู่ในห้องแล้วหรือไม่
    let existingUser = usersInRooms[pin].find(user => user.name === username);
    
    if (existingUser) {
        // อัปเดต Socket ID เป็นของแท็บใหม่
        existingUser.id = socket.id;
    } else {
        // ถ้ายังไม่มี ให้เพิ่มเข้าไปในห้อง
        usersInRooms[pin].push({ id: socket.id, name: username });
    }

    console.log(usersInRooms)

    // ✅ ส่งข้อมูลไปยังทุกคนในห้อง
    io.to(pin).emit("updateUsers", usersInRooms[pin]);
});


socket.on("leaveRoom", (pin) => {
  if (usersInRooms[pin]) {
      usersInRooms[pin] = usersInRooms[pin].filter(user => user.id !== socket.id);
      io.to(pin).emit("updateUsers", usersInRooms[pin]);

      console.log(`🔴 User left room ${pin}`);
  }
  socket.leave(pin);
});

socket.on("disconnect", () => {
  for (const pin in usersInRooms) {
      let userIndex = usersInRooms[pin].findIndex(user => user.id === socket.id);

      if (userIndex !== -1) {
          let username = usersInRooms[pin][userIndex].name;
          console.log(`⚪ User disconnected: ${username} (${socket.id})`);

          // **แทนที่จะลบออก ให้เก็บชื่อไว้ แต่ลบเฉพาะ ID**
          usersInRooms[pin][userIndex].id = null;

          // อัปเดตเฉพาะกรณีที่ไม่มี ID ที่ใช้ได้
          if (!usersInRooms[pin].some(user => user.id !== null)) {
              usersInRooms[pin] = usersInRooms[pin].filter(user => user.id !== null);
          }

          io.to(pin).emit("updateUsers", usersInRooms[pin]);
      }
  }
});

});




// ✅ Start Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

