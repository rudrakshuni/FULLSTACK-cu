import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login, logout, isLoggedIn, userName, role } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [userRole, setUserRole] = useState("user");

  return (
    <div className="card">
      {!isLoggedIn ? (
        <>
          <h3>Authentication</h3>
          <input
            placeholder="Username"
            onChange={(e) => setName(e.target.value)}
          />
          <select onChange={(e) => setUserRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={() => login(name, userRole)}>Login</button>
        </>
      ) : (
        <>
          <h3>
            Welcome {userName}
            <span className={`badge ${role}`}>{role}</span>
          </h3>
          <button className="danger" onClick={logout}>
            Logout
          </button>
        </>
      )}
    </div>
  );
}
