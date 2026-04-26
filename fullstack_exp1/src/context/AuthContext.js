import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("user");

  const login = (name, role) => {
    setIsLoggedIn(true);
    setUserName(name);
    setRole(role);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserName("");
    setRole("user");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userName, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
