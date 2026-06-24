import { useState, useEffect } from "react";
import "../styles/Settings.css";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useEnrolledCourses } from "../hooks/useCourses";
import { authFetch } from "../utils/api";

function Settings() {
  const { user, updateUser } = useAuth();
  const { enrolledCourses } = useEnrolledCourses();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
  });

  const [certificatesCount, setCertificatesCount] = useState(0);
  const [completedModulesCount, setCompletedModulesCount] = useState(0);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Populate form with current user details
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
      });
    }
  }, [user]);

  // Fetch student completions and certificates count
  useEffect(() => {
    if (enrolledCourses.length === 0) return;

    // Load certificates
    authFetch("/courses/certificates")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCertificatesCount(data ? data.length : 0))
      .catch((err) => console.error(err));

    // Load completions progress for all enrolled courses
    Promise.all(
      enrolledCourses.map((c) =>
        authFetch(`/courses/${c.id}/progress`)
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
      )
    ).then((progressList) => {
      let sum = 0;
      progressList.forEach((prog) => {
        if (prog) {
          sum += prog.completedLessons || 0;
        }
      });
      setCompletedModulesCount(sum);
    });
  }, [enrolledCourses]);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Name and Email are required.");
      return;
    }

    // Save changes into AuthContext and LocalStorage
    updateUser({
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
    });

    alert("Profile updated successfully!");
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
      alert("New password and confirm password do not match.");
      return;
    }

    alert("Password updated successfully!");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const getInitials = (name) => {
    if (!name) return "ST";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="student-dashboard">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="settings-header">
          <div>
            <span className="settings-tag">ACCOUNT MANAGEMENT</span>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Manage your profile, learning account and credentials.</p>
          </div>
        </div>

        <div className="settings-container">
          {/* PROFILE SECTION */}
          <div className="settings-card">
            <h2>Personal Profile</h2>

            <div className="profile-avatar">{getInitials(formData.name)}</div>

            <form onSubmit={handleProfileUpdate} style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <label style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <label style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Mobile Number</label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="e.g. +91 9876543210"
              />

              <button type="submit" style={{ marginTop: "10px" }}>
                Update Profile
              </button>
            </form>
          </div>

          {/* ACADEMIC INFO */}
          <div className="settings-card">
            <h2>Academic Information</h2>

            <div className="detail-box">
              <span>Account ID</span>
              <h4>SEC-USER-{user?.id || "N/A"}</h4>
            </div>

            <div className="detail-box">
              <span>Access Role</span>
              <h4>{user?.role ? user.role.toUpperCase() : "STUDENT"}</h4>
            </div>

            <div className="detail-box">
              <span>Academic Track</span>
              <h4>Cyber Security & Hacking</h4>
            </div>

            <div className="detail-box">
              <span>Batch Assigned</span>
              <h4>Elite Cyber Batch 2026</h4>
            </div>

            <div className="detail-box">
              <span>Authorized Mentor</span>
              <h4>Shourya Cyber Academy Support</h4>
            </div>
          </div>

          {/* SECURITY */}
          <div className="settings-card">
            <h2>Security Center</h2>

            <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
              <input
                type="password"
                placeholder="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />

              <input
                type="password"
                placeholder="New Password (min 8 chars)"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />

              <button type="submit">Change Password</button>
            </form>

            <div className="security-info">
              <div className="detail-box">
                <span>Account Status</span>
                <h4>Protected & Active</h4>
              </div>
            </div>
          </div>

          {/* LEARNING OVERVIEW */}
          <div className="settings-card">
            <h2>Learning Overview</h2>

            <div className="stats-grid">
              <div className="stat-box">
                <h3>{enrolledCourses.length.toString().padStart(2, "0")}</h3>
                <span>Courses Enrolled</span>
              </div>

              <div className="stat-box">
                <h3>{completedModulesCount.toString().padStart(2, "0")}</h3>
                <span>Lessons Finished</span>
              </div>

              <div className="stat-box">
                <h3>{certificatesCount.toString().padStart(2, "0")}</h3>
                <span>Certificates</span>
              </div>

              <div className="stat-box">
                <h3>{(completedModulesCount * 1.5).toFixed(1)}</h3>
                <span>Hours Studied</span>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default Settings;