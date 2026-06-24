import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();
const AUTH_KEY = "lms_token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEY);
    const stored = localStorage.getItem("user");

    if (token && stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = (token, userData) => {
    const safeUser = {
      id: userData.id,
      name: userData.name || "",
      email: userData.email,
      role: userData.role ? userData.role.toLowerCase() : "",
      mobile: userData.mobile || "",
    };

    localStorage.setItem(AUTH_KEY, token);
    localStorage.setItem("user", JSON.stringify(safeUser));
    setUser(safeUser);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);