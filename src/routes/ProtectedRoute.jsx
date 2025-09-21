// src/routes/ProtectedRoute.jsx
import { useAuth } from "../context/AuthContext.jsx"

// Komponentti, joka käärii suojatun sisällön
// - Jos status = SKELETON → odotetaan (ei näytetä mitään vielä)
// - Jos status != USER → näytetään portti (gate)
// - Jos status = USER → näytetään children (suojattu sisältö)
export default function ProtectedRoute({ children, gateMessage = "This page requires sign in.", returnTo }) {
    const { status } = useAuth();

    if (status === "SKELETON") {
        return null; // odotetaan että AuthContext ehtii tarkistaa tokenin
    }

    if (status !== "USER") {
        // Jos käyttäjä tuli suojatulle sivulle ilman kirjautumista,
        // tallennetaan paluuosoite (returnTo) sessionStorageen
        if (returnTo) sessionStorage.setItem("returnTo", returnTo);

        return (
            <div style={{ padding: "2rem" }}>
                <h2>🔒 Gate</h2>
                <p>{gateMessage}</p>
                <p>
                    Jatka kirjautumalla sisään:{" "}
                    <a href="/signin">Sign in</a>
                </p>
            </div>
        );
    }

    // Jos käyttäjä on kirjautunut → näytetään suojattu sisältö
    return children;
}

