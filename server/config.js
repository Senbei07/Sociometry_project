import mysql from "mysql2/promise";

// สร้าง connection pool สำหรับ MySQL
const dbConnection = mysql.createPool({
  host: "localhost",
  user: "root",       // เปลี่ยนเป็นชื่อผู้ใช้ MySQL ของคุณ
  password: "",       // ใส่รหัสผ่านของคุณ
  database: "sociometry", // เปลี่ยนเป็นชื่อฐานข้อมูลของคุณ
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default dbConnection; // ใช้ export default
