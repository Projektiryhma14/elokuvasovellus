// src/screens/SignIn.jsx
import "./SignIn.css";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignIn() {
    const navigate = useNavigate();
    const { signIn, status, authError } = useAuth();

    // Paluuosoite ProtectedRoute-portilta
    const [returnTo, setReturnTo] = useState(null);

    // Lomakekenttien tila
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // UI-tila
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState(null);

    useEffect(() => {
        const r = sessionStorage.getItem("returnTo");
        if (r) setReturnTo(r);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);

        if (!username || !password) {
            setLocalError("Please enter both username and password.");
            return;
        }

        setLoading(true);
        const result = await signIn({ username, password, returnTo });
        setLoading(false);

        if (result.ok) {
            // Tyhjennetään returnTo, jos sellainen oli
            sessionStorage.removeItem("returnTo");
            // Ohjataan takaisin haluttuun reittiin tai etusivulle
            navigate(returnTo || "/", { replace: true });
        } else {
            // Näytetään virhe (backendista tai verkosta)
            // authError tulee Contextista, mutta pidetään myös localError, jos haluat erottaa validointivirheen
            if (result.error) setLocalError(result.error);
        }
    };

    return (
        <div className="wrapper">
            <div className="signin_container">
                <form className="sign_in_form" onSubmit={handleSubmit} noValidate>
                    <h1>Sign in</h1>

                    <div>
                        <label htmlFor="username">Enter your username:</label>
                        <input
                            id="username"
                            type="text"

                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="password">Enter your password:</label>
                        <input
                            id="password"
                            type="password"

                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {(localError || authError) && (
                        <p className="error_msg" role="alert">
                            {localError || authError}
                        </p>
                    )}

                    <button className="signin_button" type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                    <p style={{ marginTop: "0.75rem" }}>
                        Don't have an account?{" "}
                        <Link to="/signup">Click here to sign up</Link>
                    </p>

                    {returnTo && (
                        <p style={{ fontSize: 12, opacity: 0.7, marginTop: "0.5rem" }}>
                            After signing in, you’ll be redirected to: <code>{returnTo}</code>
                        </p>
                    )}
                </form>

                {/* Debug-info: näyttää nykyisen status-tilan (SKELETON, GUEST, USER) */}
                <p style={{ fontSize: 12, opacity: 0.6, marginTop: "1rem" }}>
                    Status: <strong>{status}</strong>
                </p>
            </div>
        </div>
    );
}
