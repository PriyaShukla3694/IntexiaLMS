import { useState, useEffect } from "react";
import "../styles/InstructorSettings.css";
import InstructorSidebar from "../components/InstructorSidebar";
import Topbar from "../components/Topbar";
import { useAuth } from "../context/AuthContext";

function InstructorSettings() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    designation: "Certified Cyber Security Trainer",
    experience: "8 Years",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
      }));
    }
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Name and Email are required.");
      return;
    }

    updateUser({
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
    });

    alert("Settings updated successfully!");
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      alert("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    alert("Password updated successfully!");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="settings-page">
      <InstructorSidebar />

      <div className="settings-content">
        <Topbar />

        <div className="settings-header">
          <div>
            <span>ACCOUNT SETTINGS</span>
            <h1>Instructor Settings</h1>
            <p>Manage your profile, teaching details and security credentials.</p>
          </div>
        </div>

        <div className="settings-card">
          <h2>Profile Information</h2>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="e.g. +91 9876543210"
              />
            </div>

            <div className="form-group">
              <label>Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Experience</label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
            </div>

            <button type="submit" className="save-btn" style={{ width: "fit-content", padding: "12px 30px" }}>
              Save Changes
            </button>
          </form>

          <hr style={{ margin: "30px 0", borderColor: "rgba(255,255,255,0.08)" }} />

          <h2>Change Password</h2>

          <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                placeholder="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>New Password (min 8 chars)</label>
              <input
                type="password"
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm Password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>

            <button type="submit" className="save-btn" style={{ width: "fit-content", padding: "12px 30px" }}>
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default InstructorSettings;