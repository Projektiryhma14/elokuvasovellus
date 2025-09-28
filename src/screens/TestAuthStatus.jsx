// TestAuthStatus.jsx
import { useAuth } from "../context/AuthContext.jsx";

export default function TestAuthStatus() {
    const { status } = useAuth();
    return <p style={{ padding: "1rem", background: "#eee" }}>Auth status: {status}</p>;
}
