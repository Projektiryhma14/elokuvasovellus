// src/routes/ProtectedRoute.jsx
import { useAuth } from "../context/AuthContext.jsx"
import { FaShieldHalved } from 'react-icons/fa6';
import { FaUser } from "react-icons/fa6";

// Komponentti, joka käärii suojatun sisällön
// - Jos status = SKELETON → odotetaan (ei näytetä mitään vielä)
// - Jos status != USER → näytetään portti (gate)
// - Jos status = USER → näytetään children (suojattu sisältö)
export default function ProtectedRoute({
    children,                                                       // suojattu sisältö (React-elementit)
    gateMessage = "This page requires sign in.",                    // oletusviesti portille
    returnTo                                                        // polku, johon käyttäjä halutaan ohjata loginin jälkeen
}) {
    const { status } = useAuth();

    // 1) Jos status = SKELETON → odotetaan (AuthContext vielä tarkistaa tokenia)
    if (status === "SKELETON") {
        return null;                                                // ei näytetä mitään tässä vaiheessa
    }

    if (status !== "USER") {
        // Jos tälle reitille annettiin returnTo-prop (esim. "/profile"),
        // tallennetaan se sessionStorageen → käytetään signIn-sivulla
        if (returnTo) sessionStorage.setItem("returnTo", returnTo);

        // Näytetään "portti" eli pieni ilmoitus + linkki kirjautumiseen
        return (
            <div style={{ padding: "2rem" }}>
                <h2>🔒 Gate123</h2>

                <p>{gateMessage}</p>
                <p>
                    Jatka kirjautumalla sisään:{" "}
                    <a href="/signin">Sign in</a>
                </p>
            </div>
        );
    }

    // 3) Jos status = USER → käyttäjä on kirjautunut
    // Palautetaan children eli suojattu sisältö
    return children;
}