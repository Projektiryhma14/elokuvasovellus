// src/screens/SignIn.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from './SignIn.module.css'

// Link = React Routerin linkki (korvaa <a href>)
// useNavigate = ohjelmallinen siirtyminen toiseen reittiin

import { useAuth } from "../context/AuthContext";
// Oma hook (AuthContextista), jolla käytetään signIn, status, authError jne.

export default function SignIn() {
    const navigate = useNavigate();

    // Haetaan contextista kirjautumisfunktio, auth-tila ja viimeisin virhe
    const { signIn, status, authError } = useAuth();

    // Paluuosoite ProtectedRoute-portilta (jos käyttäjä yritti suojattuun sivuun)
    const [returnTo, setReturnTo] = useState(null);

    // Lomakekenttien tila
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // UI-tila
    const [loading, setLoading] = useState(false);          // näytetäänkö "Signing in..."
    const [localError, setLocalError] = useState(null);     // lomakevalidoinnin virheet

    // Kun komponentti latautuu → haetaan mahdollinen returnTo sessionStoragesta
    useEffect(() => {
        const r = sessionStorage.getItem("returnTo");
        if (r) setReturnTo(r);
    }, []);

    // Lomakkeen submit-käsittelijä
    const handleSubmit = async (e) => {
        e.preventDefault();                                 // estetään sivun uudelleenlataus
        setLocalError(null);                                // nollataan vanha virhe

        // Jos kentät tyhjiä → näytetään virhe
        if (!username || !password) {
            setLocalError("Please enter both username and password.");
            return;
        }

        // Ladataan: estetään painike ja näytetään "Signing in..."
        setLoading(true);
        const result = await signIn({ username, password });
        setLoading(false);

        if (result.ok) {
            // Luodaan paluuosoite
            const to = sessionStorage.getItem("returnTo");

            // navigoidaan: jos to on, mennään sinne. Muuten etusivulle
            if (to) {
                sessionStorage.removeItem("returnTo")
                navigate(to, { replace: true })

            } else {
                navigate("/", { replace: true })
            }
        } else {
            // Näytetään kontekstin virhe tai signInin palauttama virhe
            if (result?.error) setLocalError(result.error)
        }

        //if (result.ok) {
        //    // Jos login onnistui:
        //    sessionStorage.removeItem("returnTo");      // poistetaan paluuosoite
        //    navigate("/", { replace: true });           // Ohjataan takaisin etusivulle
        //} else {
        //    // Jos login epäonnistui: näytetään virhe
        // authError tulee Contextista (esim. backendistä), 
        // localError on omalle validoinnille
        //    if (result.error) setLocalError(result.error);
        //}

    };



    return (
        <div className={`container mt-5 ${styles.sign_in_wrapper}`}>

            <form className={styles.sign_in_form} onSubmit={handleSubmit} noValidate>
                <h2 className='mb-4'>Sign in</h2>

                <div className="mb-3">
                    <label htmlFor='username' className={styles.sign_in_form_label}>
                        Enter your username:</label>
                    <input
                        id="username"
                        type="text"

                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}                               // estetään syöttö kun login on käynnissä
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor='password' className={styles.sign_in_form_label}
                    >Enter your password:</label>
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

                <div className="mb-3">
                    <button className="btn btn-primary" type="submit" disabled={loading}>
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
                </div>
            </form>


            {/* Debug-info: näyttää nykyisen status-tilan (SKELETON, GUEST, USER) 
                
                <p style={{ fontSize: 12, opacity: 0.6, marginTop: "1rem" }}>
                    Status: <strong>{status}</strong>
                </p>*/}


        </div>
    );
}
