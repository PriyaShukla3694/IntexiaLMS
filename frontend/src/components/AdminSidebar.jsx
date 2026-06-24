import { useState, useEffect } from "react";
import "./Sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  FaHome,
  FaUsers,
  FaBook,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";

function AdminSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", collapsed);
    if (collapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">

      <div>

        <div className="sidebar-header" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            {!collapsed && (
              <div>
                <h1 style={{ fontSize: "28px" }}>INTEXIA</h1>
                <p style={{ fontSize: "12px", color: "#8b94a7" }}>Admin Panel</p>
              </div>
            )}
            <FaBars
              onClick={() => setCollapsed(!collapsed)}
              style={{ cursor: "pointer", fontSize: "20px", color: "#C48A52", margin: collapsed ? "0 auto" : "0" }}
            />
          </div>
        </div>

        <nav className="sidebar-nav">

          <NavLink
            to="/admin-dashboard"
            className="nav-link"
          >
            <div className="nav-item">
              <FaHome />
              <span>Dashboard</span>
            </div>
          </NavLink>

          <NavLink
            to="/user-management"
            className="nav-link"
          >
            <div className="nav-item">
              <FaUsers />
              <span>Users</span>
            </div>
          </NavLink>

          <NavLink
            to="/course-approval"
            className="nav-link"
          >
            <div className="nav-item">
              <FaBook />
              <span>Course Approval</span>
            </div>
          </NavLink>

          <NavLink
            to="/platform-analytics"
            className="nav-link"
          >
            <div className="nav-item">
              <FaChartBar />
              <span>Analytics</span>
            </div>
          </NavLink>

          <NavLink
            to="/admin-settings"
            className="nav-link"
          >
            <div className="nav-item">
              <FaCog />
              <span>Settings</span>
            </div>
          </NavLink>

        </nav>

      </div>

      <div className="sidebar-footer">

        <div
          className="logout-btn"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </div>

      </div>

    </aside>
  );
}

export default AdminSidebar;