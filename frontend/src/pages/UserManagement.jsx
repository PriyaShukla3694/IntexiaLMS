import { useState, useEffect } from "react";
import "../styles/AdminPages.css";
import AdminSidebar from "../components/AdminSidebar";
import Topbar from "../components/Topbar";
import { authFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    authFetch("/admin/users")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load users list");
        return res.json();
      })
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Error loading system user accounts.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await authFetch(`/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        fetchUsers();
      } else {
        alert("Failed to update user role.");
      }
    } catch (err) {
      console.error(err);
      alert("Error changing user role.");
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      alert("You cannot delete your own admin account.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user? This will remove all their enrollments, progress stats, and certificates from the database."
    );

    if (confirmDelete) {
      try {
        const res = await authFetch(`/admin/users/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          fetchUsers();
        } else {
          alert("Failed to delete user.");
        }
      } catch (err) {
        console.error(err);
        alert("Error deleting user account.");
      }
    }
  };

  const filteredUsers =
    filter === "All"
      ? users
      : users.filter((u) => u.role.toLowerCase() === filter.toLowerCase());

  return (
    <div className="admin-page">
      <AdminSidebar />

      <div className="admin-main">
        <Topbar />

        <h1 className="page-title">User Management</h1>

        <div className="user-filter">
          <button
            className={filter === "All" ? "active-filter" : ""}
            onClick={() => setFilter("All")}
          >
            All
          </button>

          <button
            className={filter === "Student" ? "active-filter" : ""}
            onClick={() => setFilter("Student")}
          >
            Students
          </button>

          <button
            className={filter === "Instructor" ? "active-filter" : ""}
            onClick={() => setFilter("Instructor")}
          >
            Instructors
          </button>
        </div>

        {loading ? (
          <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "40px" }}>
            <h3>Loading database users...</h3>
          </div>
        ) : error ? (
          <div style={{ color: "#f87171", textAlign: "center", padding: "40px" }}>
            <h3>{error}</h3>
          </div>
        ) : (
          <div className="users-grid">
            {filteredUsers.length === 0 ? (
              <div style={{ color: "var(--text-secondary)", gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>
                <h3>No Users Found</h3>
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div className="user-card" key={u.id}>
                  <h3>{u.name}</h3>
                  <p>
                    <strong>Email:</strong> {u.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {u.role}
                  </p>

                  <div style={{ marginTop: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
                    <label style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Change Role:</label>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{
                        padding: "4px 8px",
                        background: "#181821",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "6px",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="INSTRUCTOR">Instructor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <div className="user-actions" style={{ marginTop: "16px" }}>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(u.id)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;