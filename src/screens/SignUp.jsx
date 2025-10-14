
import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios'
import styles from './SignUp.module.css'


const API_BASE = import.meta.env.VITE_API_BASE_URL


function SignUp() {

    const navigate = useNavigate();

    const [user, setUser] = useState({ email: '', username: '', password: '' })

    // Vahvistuskenttä
    const [confirm, setConfirm] = useState('')

    // UI-viestit (onnistuminen ja virhe)
    const [statusMessage, setStatusMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    // Saatavuus-UX: "tarkistetaan" tilat ha saatavuuden tulos
    const [checkingEmail, setCheckingEmail] = useState(false)
    const [checkingUsername, setCheckingUsername] = useState(false)
    const [emailAvailable, setEmailAvailable] = useState(null) // true | false | null (null = ei vielä tarkistettu)
    const [usernameAvailable, setUsernameAvailable] = useState(null)


    // -------------------------------------------------------------
    // Johdetut tarkistukset salasanalle (useMemo):
    // - Lasketaan vain kun password/confirm muuttuvat → suorituskyky ja selkeys
    // - Vaatimukset:
    //    * vähintään 8 merkkiä
    //    * vähintään 1 ISO kirjain (A–Z)
    //    * vähintään 1 numero (0–9)
    //    * vähintään 1 erikoismerkki (joukosta alla)
    // - matchOk: confirm vastaa passwordia
    // -------------------------------------------------------------
    const { lengthOk, upperOk, digitOk, specialOk, allOk, matchOk } = useMemo(() => {
        const pwd = user.password || ''
        const lengthOk = pwd.length >= 8
        const upperOk = /[A-Z]/.test(pwd)
        const digitOk = /\d/.test(pwd)
        // Regex sallittuihin erikoismerkkeihin; voidaan laajentaa
        const specialOk = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(pwd)
        const allOk = lengthOk && upperOk && digitOk && specialOk
        // Vahvistus: ei tyhjä ja täsmää
        const matchOk = pwd.length > 0 && pwd === confirm

        return { lengthOk, upperOk, digitOk, specialOk, allOk, matchOk }
    }, [user.password, confirm])

    // -------------------------------------------------------------
    // Debounce-check EMAIL:
    // - Odotetaan 400 ms, ennen kuin lähetetään pyyntö /check-email
    // - Estää turhat pyynnöt jokaisella näppäinpainalluksella
    // - Race condition -suojana käytetään "usedInput":ia ja verrataan nykyiseen arvoon
    // - Virhetilanteessa (verkko tms.) merkitään varmuuden vuoksi “ei vapaa”
    // -------------------------------------------------------------

    //--------------------------------------------------------------
    // RACE-condition:
    // Käyttäjä kirjoittaa pelle@ → käynnistyy setTimeout joka lähettää pyynnön /check-email?pelle@ 400 ms kuluttua.

    //Heti perään käyttäjä kirjoittaa pelle@test.com → uusi setTimeout käynnistyy, ja se lähettää pyynnön /check-email?pelle@test.com.

    //Jos ensimmäinen pyyntö ehtii vastata viimeisen jälkeen, se voi yliajaa uudemman tuloksen.
    //Tämä on race condition: vastaukset eivät välttämättä saavu samassa järjestyksessä kuin ne lähetettiin.

    // Suoja usedInput -muuttujalla
    // usedInput = se arvo, jota varten tämä nimenomainen pyyntö tehtiin.
    // Kun vastaus tulee takaisin, vertaillaan:

    //Jos nykyinen input (user.email) on edelleen sama kuin usedInput, tulos hyväksytään.

    //Jos käyttäjä ehti kirjoittaa lisää (eli user.email !== usedInput), ohitetaan vastaus → näin vanha pyyntö ei voi sotkea tilaa.
    //--------------------------------------------------------------

    useEffect(() => {
        const val = (user.email || "").trim()
        // Kun arvo muuttuu, nollataan saatavuus näkyvistä (näytetään “...tarkistetaan” kun pyörähtää)
        setEmailAvailable(null)
        if (!val) {
            setCheckingEmail(false)
            return
        }
        setCheckingEmail(true)
        const t = setTimeout(async () => {
            try {
                const usedInput = val // -lukitaan arvo race conditonin välttämiseksi
                const res = await axios.get(`${API_BASE}/check-email`, {
                    params: {
                        email: usedInput
                    }
                })
                // Varmistetaan, että vastaus vastaa edelleen ruudulla olevaa arvoa
                if ((user.email || "").trim() === usedInput) {
                    setEmailAvailable(Boolean(res.data?.available))
                }
            } catch (e) {
                // Verkkovirhe -> ei kaadeta UI:ta; merkitään varmuuden vuoksi "ei vapaa"
                setEmailAvailable(false)
            } finally {
                setCheckingEmail(false)
            }
        }, 400) // 400ms debounce
        // Siivous: jos käyttäjä kirjoittaa lisää ennen timeoutia, perutaan vanha
        return () => clearTimeout(t)
    }, [user.email])

    // -------------------------------------------------------------
    // Debounce-check USERNAME:
    // - Sama logiikka kuin sähköpostille
    // -------------------------------------------------------------
    useEffect(() => {
        const val = (user.username || "").trim()
        setUsernameAvailable(null)
        if (!val) {
            setCheckingUsername(false)
            return
        }
        setCheckingUsername(true)
        const t = setTimeout(async () => {
            try {
                const usedInput = val
                const res = await axios.get(`${API_BASE}/check-username`, {
                    params: {
                        username: usedInput
                    }
                })
                if ((user.username || "").trim() === usedInput) {
                    setUsernameAvailable(Boolean(res.data?.available))
                }
            } catch (e) {
                setUsernameAvailable(false)
            } finally {
                setCheckingUsername(false)
            }
        }, 400)
        return () => clearTimeout(t)
    }, [user.username])

    // -------------------------------------------------------------
    // canSubmit:
    // - Yhdistää kaikki ehdot, jotka vaaditaan lähetykseen:
    //   * salasanaehdot täyttyvät (allOk)
    //   * confirm täsmää (matchOk)
    //   * email ja username ovat saatavilla (emailAvailable/usernameAvailable === true)
    //   * kentissä on arvo (user.email, user.username)
    // -------------------------------------------------------------
    const canSubmit =
        allOk &&
        matchOk &&
        emailAvailable === true &&
        usernameAvailable === true &&
        user.email &&
        user.username

    // -------------------------------------------------------------
    // Submit-käsittelijä:
    // - Estää lomakkeen oletustoiminnon (sivun lataus)
    // - Tarkistaa canSubmit: jos ei täyty, näytetään virhe
    // - POST /signup
    // - Onnistumisen jälkeen tyhjennetään kentät ja siirretään /signin 1.5 s viiveellä
    //   (viive antaa mahdollisuuden nähdä onnistumisviestin)
    // - Virheissä luetaan backendin error-viesti (esim. 409: “already in use”)
    // -------------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMessage('')
        setStatusMessage('')

        if (!canSubmit) {
            setErrorMessage("Make sure to meet the requirements and also that the email and username are free.")
            return
        }

        try {
            const res = await axios.post(`${API_BASE}/signup`, user)
            setStatusMessage("Registration successful! Moving to the sign in page...")
            // tyhjennys
            setUser({ email: "", username: "", password: "" })
            setConfirm("")
            // Tyhjennä myös itse form-elementti
            e.target.reset()
            // automaattinen siirto
            setTimeout(() => {
                navigate("/signin", {
                    // replace: true -> “korvaa” historiaan tämä sivu; Back ei palaa signup-sivulle
                    replace: true,
                    // flash-viestin voi lukea SignIn.jsx:ssä location.state:sta
                    state: { flash: "Sign up successful - log in" },
                })
            }, 1500)
        } catch (err) {
            const msg = err?.response?.data?.error || "Registration failed"
            setErrorMessage(msg)

        }
    }


    return (


        <div className={`container mt-5 ${styles.signup_wrapper}`}>


            <form className={styles.sign_up_form} onSubmit={e => { handleSubmit(e) }}>
                <h2 className='mb-4'>Sign up</h2>
                <div className="mb-3">
                    <label htmlFor='email' className={styles.sign_up_form_label}>
                        Insert your email:</label>
                    <input
                        type="email" required
                        onChange={e => setUser({ ...user, email: e.target.value })}
                    />
                    <small class={styles.sign_up_help} id="email-help">
                        {checkingEmail
                            ? "…checking"
                            : emailAvailable === true
                                ? "✅ Email is available"
                                : emailAvailable === false
                                    ? "❌ Email is already in use"
                                    : ""}
                    </small>
                </div>

                <div className="mb-3">
                    <label htmlFor='username' className={styles.sign_up_form_label}>
                        Choose your username:</label>
                    <input
                        type="text" required
                        onChange={e => setUser({ ...user, username: e.target.value })}

                    />
                    <div>
                        <small class={styles.sign_up_help} id="username-help">
                            {checkingUsername
                                ? "…checking"
                                : usernameAvailable === true
                                    ? "✅ Username is available"
                                    : usernameAvailable === false
                                        ? "❌ Username is already in use"
                                        : ""}
                        </small>
                    </div>

                </div>

                <div>
                    <label htmlFor='password' className={styles.sign_up_form_label}>
                        Choose your password:</label>
                    <input type="password" required
                        onChange={e => setUser({ ...user, password: e.target.value })}
                    />

                    {/* Checklist (reaaliaikainen) */}
                    <ul className={styles.sign_up_ul} id="password-help" style={{ marginTop: 6 }}>
                        <li style={{ opacity: lengthOk ? 1 : 0.6 }}>{lengthOk ? '✓' : '•'} atleast 8 characters</li>
                        <li style={{ opacity: upperOk ? 1 : 0.6 }}>{upperOk ? '✓' : '•'} atleast ONE uppercase letter (A–Z)</li>
                        <li style={{ opacity: digitOk ? 1 : 0.6 }}>{digitOk ? '✓' : '•'} atleast ONE number (0–9)</li>
                        <li style={{ opacity: specialOk ? 1 : 0.6 }}>{specialOk ? '✓' : '•'} atleast ONE special character (!@#$…)</li>
                    </ul>
                </div>

                <div className="mb-3">
                    <label htmlFor='username' className={styles.sign_up_form_label}>
                        Confirm your password</label>
                    <input
                        type='password'
                        required
                        onChange={e => setConfirm(e.target.value)}
                    />
                    {!matchOk && confirm.length > 0 && (
                        <small id="confirm-help" style={{ color: 'crimson' }}>
                            Passwords do not match
                        </small>
                    )}
                </div>




                <div className='mb-3'>
                    <button

                        className="btn btn-primary"
                        type="submit"
                        disabled={!(allOk && matchOk)}
                        title={!(allOk && matchOk) ? 'Please meet the requirements before continuing' : 'Send'}
                    >
                        Sign up
                    </button>


                    <p style={{ marginTop: "0.75rem" }}>
                        If you have been Sign up:{" "}
                        <Link to="/signin">Click here to sign in</Link>
                    </p>

                    {errorMessage && <p style={{ color: 'crimson' }}>{errorMessage}</p>}
                    {statusMessage && <p style={{ color: 'green' }}>{statusMessage}</p>}

                </div>
            </form>
        </div>
    );
}

export default SignUp   