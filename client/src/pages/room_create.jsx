import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/room_create.css";

function Room() {
    
    const [showForm, setShowForm] = useState(false);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [formData, setFormData] = useState({
        group_name: "",
        group_question: "",
        group_quantity: "1",
        theme_id: "1"
    });

    useEffect(() => {
        fetchGroups();
    }, []);

    function fetchGroups() {
        fetch("/api/groups")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setGroups(data.groups);
                }
            })
            .catch(err => console.error("Error fetching groups:", err));
    }

    function fetchGroupDetails(groupId) {
        fetch(`/api/groups/${groupId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSelectedGroup(data.group);
                }
            })
            .catch(err => console.error("Error fetching group details:", err));
    }

    function toggleForm() {
        setShowForm(!showForm);
    }

    function handleChange(event) {
        setFormData({ ...formData, [event.target.id]: event.target.value });
    }

    function handleCreateGroup(event) {
        event.preventDefault();

        fetch("/api/groups", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert(`Group created successfully! PIN: ${data.group_pin}`);
                    setShowForm(false);
                    setFormData({ group_name: "", group_question: "", group_quantity: "1", theme_id: "1" });
                    fetchGroups();
                } else {
                    alert("Failed to create group: " + data.message);
                }
            })
            .catch(err => console.error("Error creating group:", err));
    }

    return (
        <>
            <Helmet>
                <title>จัดการห้อง</title>
            </Helmet>

            <div className="container py-5">
                <h1 className="mb-4 text-start text-primary fw-bold">All Groups</h1>

                <button className="btn btn-lg btn-outline-primary mb-3" onClick={toggleForm}>
                    + Create Group
                </button>

                <div className="row">
                    {groups.length > 0 ? (
                        groups.map(group => (
                            <div key={group.group_id} className="col-md-6 col-lg-4 mb-3">
                                <div className="card shadow-sm border-0">
                                    <div className="card-body">
                                        <h5 className="card-title text-primary">{group.group_name}</h5>
                                        <button className="btn btn-sm btn-outline-info" onClick={() => fetchGroupDetails(group.group_id)}>
                                            ดูรายละเอียด
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted text-center">ไม่มีห้องที่ถูกสร้าง</p>
                    )}
                </div>
            </div>

            {/* Modal ดูรายละเอียดห้อง */}
            {selectedGroup && (
                <div className="modal show d-block">
                    <div className="modal-dialog">
                        <div className="modal-content shadow-lg">
                            <div className="modal-header">
                                <h5 className="modal-title">รายละเอียดห้อง</h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedGroup(null)}></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Name:</strong> {selectedGroup.group_name}</p>
                                <p><strong>PIN:</strong> {selectedGroup.group_pin}</p>
                                <p><strong>Owner:</strong> {selectedGroup.owner_name}</p>
                                <p><strong>Question:</strong> {selectedGroup.group_question}</p>
                                <p><strong>Quantity:</strong> {selectedGroup.group_quantity}</p>
                                <p><strong>Theme ID:</strong> {selectedGroup.theme_id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal สร้างห้อง */}
            {showForm && (
                <div className="modal show d-block">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow-lg">
                            <div className="modal-header">
                                <h5 className="modal-title">Create New Group</h5>
                                <button type="button" className="btn-close" onClick={toggleForm}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleCreateGroup}>
                                    <div className="mb-3">
                                        <label htmlFor="group_name" className="form-label">ชื่อห้อง</label>
                                        <input type="text" id="group_name" className="form-control" value={formData.group_name} onChange={handleChange} placeholder="กรอกชื่อห้อง" required />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="group_question" className="form-label">คำถาม</label>
                                        <input type="text" id="group_question" className="form-control" value={formData.group_question} onChange={handleChange} placeholder="กรอกคำถาม" required />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="group_quantity" className="form-label">จำนวนอันดับ</label>
                                            <select id="group_quantity" className="form-select" value={formData.group_quantity} onChange={handleChange}>
                                                {[1, 2, 3, 4].map(num => (
                                                    <option key={num} value={num}>{num}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="theme_id" className="form-label">สถานการณ์</label>
                                            <select id="theme_id" className="form-select" value={formData.theme_id} onChange={handleChange}>
                                                <option value="1">รถบัส</option>
                                                <option value="2">รถไฟ</option>
                                                <option value="3">เครื่องบิน</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <button type="submit" className="btn btn-lg btn-success">สร้างห้อง</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {(showForm || selectedGroup) && <div className="modal-backdrop show"></div>}
        </>
    );
}

export default Room;
