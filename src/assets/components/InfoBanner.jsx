// MIKÄ on useRef ja miksi sitä käytetään tässä
// - useRef on Reactin hook, joka antaa muistipaikan, joka säilyy renderöintien yli
// - Sen .current -kenttä on kuin muuttuja, jota voidaan muokata ilman, että komponentti renderöityy uudestaan








import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./InfoBanner.module.css";

export default function InfoBanner() {
    const location = useLocation();
    const navigate = useNavigate();

    // Bannerin teksti (null = ei mitään näytettävää)
    const [msg, setMsg] = useState(null);

    // Näkyvyys (true = täysi näkyvyys, false = ei mitään näytettävää)
    const [visible, setVisible] = useState(false);

    // Ajastimet (ms). Banneri näkyy ensin täytenä, sitten feidaa pois
    const SHOW_MS = 2500;
    const FADE_MS = 1500;

    // Ref-muuttuja: käytetään pitämään kirjaa fade-ajastimesta
    // Ref EI aiheuta uutta renderöintiä kuten useState.
    // Tänne voi tallentaa muuttujan, joka säilyy renderöintien yli.
    const fadeTimerRef = useRef(null);

    // --- 1) Otetaan vastaan mahdollinen flash-viesti navigaatiosta ---
    useEffect(() => {
        const flash = location.state?.flash;
        if (flash) {
            setMsg(flash);
            setVisible(true);
            // Tyhjennetään location.state, jotta back/forward ei tuo banneria takaisin
            navigate(location.pathname + location.search, { replace: true, state: {} });
        }
        // Re-run on every navigation so new flash messages are detected
    }, [location.key, location.pathname, location.search, location.state, navigate]);

    // --- 2) Näytetään banneri 2.5s, sitten fade-out 1.5s ---
    useEffect(() => {
        if (!msg) return;                                   // jos ei viestiä → ei tehdä mitään

        setVisible(true);                                   // varmistetaan että näkyy heti kun msg tulee

        // Ensimmäinen ajastin: odota 2.5s → aloita fade-out
        const t1 = setTimeout(() => {
            setVisible(false); // start fade-out
            // Remove message after fade completes
            fadeTimerRef.current = setTimeout(() => {
                setMsg(null);
                fadeTimerRef.current = null;                // Nollataan ref
            }, FADE_MS);
        }, SHOW_MS);

        // Cleanup: jos komponentti unmountataan ennen aikarajaa,
        // tyhjennetään molemmat ajastimet
        return () => {
            clearTimeout(t1);
            if (fadeTimerRef.current) {
                clearTimeout(fadeTimerRef.current);
                fadeTimerRef.current = null;
            }
        };
    }, [msg]);

    // Jos ei ole viestiä → ei näytetä mitään
    if (!msg) return null;

    // Näytetään banneri: lisätään .fade_out luokka kun visible=false
    return (
        <div className={`${styles.info_banner} ${!visible ? styles.fade_out : ""}`}>
            {msg}
        </div>
    );
}
