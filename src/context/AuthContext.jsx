// src/context/AuthContext.jsx
//---------------------------------------
// Auth-katto: hallinnoi SKELETON -> GUEST -> USER -tiloja
// Tässä mallissa ei auto-login


// src/context/AuthContext.jsx
// -----------------------------------------------------
// AuthContext hoitaa auth-tilat: SKELETON -> GUEST -> USER
// Käytetään axiosia backend-kutsuihin

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Käytetään frontendin .env-muuttujaa
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function AuthProvider({ children }) {
    const [status, setStatus] = useState("SKELETON"); // SKELETON | GUEST | USER
    const [user, setUser] = useState(null);           // { id, email } | null
    const [authError, setAuthError] = useState(null); // viimeisin signin-virhe

    // 1) Alku: tarkistetaan sessionStorage → asetetaan tila sen mukaan
    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const email = sessionStorage.getItem("email");
        const id = sessionStorage.getItem("user_id");

        if (token && email && id) {
            setUser({ id, email });
            setStatus("USER");
        } else {
            setStatus("GUEST");
        }
    }, []);

    // 2) SignIn axiosilla
    const signIn = async ({ username, password, returnTo } = {}) => {
        setAuthError(null);

        if (!username || !password) {
            const err = "Username and password are required.";
            setAuthError(err);
            return { ok: false, error: err };
        }

        try {
            
            const res = await axios.post(`${API_BASE_URL}/signin`, {
                username,
                password,
            });

            const data = res.data; // odotetaan { id, email, token }

            if (!data?.token || !data?.email || !data?.id) {
                const err = "Invalid response from server.";
                setAuthError(err);
                setStatus("GUEST");
                return { ok: false, error: err };
            }

            // Talletetaan sessionStorageen
            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("email", data.email);
            sessionStorage.setItem("user_id", String(data.id));

            // Päivitetään tila
            setUser({ id: String(data.id), email: data.email });
            setStatus("USER");

            if (returnTo) sessionStorage.setItem("returnTo", returnTo);

            return { ok: true, user: { id: String(data.id), email: data.email } };
        } catch (err) {
            let msg = "Sign in failed";
            if (err.response?.data?.error) msg = err.response.data.error;
            if (err.response?.data?.message) msg = err.response.data.message;
            if (err.message === "Network Errori") msg = "Network errori. Please try again.";

            setAuthError(msg);
            setStatus("GUEST");
            return { ok: false, error: msg };
        }
    };

    // 3) SignOut
    const signOut = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("email");
        sessionStorage.removeItem("user_id");
        sessionStorage.removeItem("returnTo");
        //ylläolevat voisi (ehkä) korvata rivillä: sessionStorage.clear()
        setUser(null);
        setStatus("GUEST");
        setAuthError(null);
    };

    // 4) Context value
    const value = useMemo(
        () => ({
            status,
            user,
            signIn,
            signOut,
            authError,
            apiBaseUrl: API_BASE_URL,
        }),
        [status, user, authError]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


