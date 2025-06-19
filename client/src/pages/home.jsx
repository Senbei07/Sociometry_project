import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";

function Home() {
    const location = useLocation(); // ใช้ดึงข้อมูลจาก state ที่ถูกส่งมาจาก App
    const { username } = location.state || {};

    return (
        <div>
            <Helmet>
                <title>Home</title> {/* เปลี่ยนชื่อหน้า */}
            </Helmet>
            <h1>Welcome, {username || "Guest"}!</h1>
            <p>This is the home page.</p>
        </div>
    );
}

export default Home;
