
// src/context/AuthContext.jsx
// -----------------------------------------------------
// AuthContext hoitaa auth-tilat: SKELETON -> GUEST -> USER
// Käytetään axiosia backend-kutsuihin

// createContext → luo Reactin kontekstin, jonka kautta auth-tila ja funktiot jaetaan muille komponenteille.
// useContext → hook, jolla muut komponentit voivat käyttää tätä kontekstia.
// useEffect → suorittaa koodin, kun komponentti renderöidään (tai riippuvuudet muuttuvat). Tässä käytetään mm. tarkistamaan sessionStorage.
// useMemo → muistaa arvon ja laskee sen uudelleen vain kun riippuvuudet muuttuvat
// useState → Reactin tila-hook, jolla tallennetaan status, user ja virheet.

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Käytetään frontendin .env-muuttujaa
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// Provider-komponentti, joka käärii koko sovelluksen
export default function AuthProvider({ children }) {
    // Auth-tilan muuttujat
    const [status, setStatus] = useState("SKELETON"); // SKELETON | GUEST | USER
    const [user, setUser] = useState(null);           // { id, email, username } | null
    const [authError, setAuthError] = useState(null); // viimeisin signin-virhe

    // 1) Kun komponentti latautuu → tarkistetaan sessionStorage
    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const id = sessionStorage.getItem("user_id");
        const email = sessionStorage.getItem("email");
        const username = sessionStorage.getItem("username");


        if (token && email && id) {
            setUser({
                id: String(id),
                email,
                username: username || undefined
            });
            setStatus("USER");
        } else {
            setStatus("GUEST");
        }
    }, []);

    // 2) SignIn axiosilla
    const signIn = async ({ username, password, returnTo } = {}) => {
        setAuthError(null); // nollataan vanhat virheet

        // jos käyttäjätunnus tai salasana puuttuu → virhe
        if (!username || !password) {
            const err = "Username and password are required.";
            setAuthError(err);
            return { ok: false, error: err };
        }

        try {
            // Tehdään POST-pyyntö backendille
            const res = await axios.post(`${API_BASE_URL}/signin`, {
                username,
                password,

            });
            console.log("SignIn response:", res.data);

            // Vastauksen oletetaan olevan { id, email, token }
            const data = res.data; // odotetaan { id, email, token }

            // Jos vastaus ei ole kelvollinen → virhe
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
            //if (data.username) sessionStorage.setItem("username", data.username);
            sessionStorage.setItem("username", data.username);

            // Reactin tilassa käytettävä user - objekti
            const nextUser = {
                id: String(data.id),
                email: data.email,
                username: data.username ?? undefined,
            }

            // Päivitetään tila
            // Tämä päivittää Authcontextin user-tilan, eli kaikki komponentit jotka lukevat const {} = useAuth()
            // Renderöityvät heti ja saavat arvon (esim profiilisivu päivittyy heti ilman sivun päivitystä)
            setUser(nextUser);
            setStatus("USER");

            // Jos returnTo on annettu (esim. ProtectedRoute-portilta) → tallennetaan se
            if (returnTo) sessionStorage.setItem("returnTo", returnTo);

            // Palautetaan onnistunut login
            // Statuslippu: kutsuva komponentti esim. (SignIn.jsx) saa tiedon, ettö kirjautuminen onnistui
            return { ok: true, user: nextUser };
        } catch (err) {
            // Jos axios heittää virheen → muodostetaan virheviesti
            let msg = "Sign in failed";
            if (err.response?.data?.error) msg = err.response.data.error;
            if (err.response?.data?.message) msg = err.response.data.message;
            if (err.message === "Network Errori") msg = "Network errori. Please try again.";

            // Tallennetaan virhetila
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
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("returnTo");
        //ylläolevat voisi (ehkä) korvata rivillä: sessionStorage.clear()

        // Nollataan Reactin tila
        setUser(null);
        setStatus("GUEST");
        setAuthError(null);
    };

    // 4) Rakennetaan value-objekti kontekstiin
    // Kaikki mitä value objektiin laitetaan -> on saatavilla näin -> const {}
    const value = useMemo(
        () => ({
            status,                             // auth-tila (SKELETON | GUEST | USER)
            user,                               // kirjautunut
            signIn,                             // kirjautumisfunktio
            signOut,                            // uloskirjautumisfunktio
            authError,                          // viimeisin virhe
            apiBaseUrl: API_BASE_URL,
        }),
        [status, user, authError]               // päivittyy vain kun nämä muuttuvat
    );

    // Provider jakaa kontekstin arvot kaikille lapsikomponenteille
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


