import React, { useEffect } from 'react'

import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate, useLocation } from "react-router-dom";

import styles from './ReviewForm.module.css'



export default function ReviewForm() {

    const navigate = useNavigate()
    const location = useLocation()

    const { status } = useAuth() // oletus: USER | GUEST | SKELETON
    const api = import.meta.env.VITE_API_BASE_URL

    // Valittu elokuva tulee TmdbSearchistä: navigate("/reviewform", { state: { selectedMovie } })
    const selectedMovie = location.state?.selectedMovie;

    console.log("ReviewForm – selectedMovie:", selectedMovie);

    // Fallback valinta sessiosta
    const [selectedFromSession, setSelectedFromSession] = useState(null)
    useEffect(() => {
        const raw = sessionStorage.getItem("pending_review")
        if (raw) {
            try {
                const x = JSON.parse(raw)
                // Muotoillaan samaan malliin kuin SelectedMovie (id, title, poster_path, vote_average)
                if (x?.movie_id && x?.movie_title) {
                    setSelectedFromSession({
                        id: x.movie_id,
                        title: x.movie_title,
                        poster_path: x.poster_path ?? null,
                        vote_average: x.vote_average ?? null,
                    })
                }
            } catch (e) {
                console.warn("pending_review parse failed", e)
            }
        }
    }, [])

    // Yhtenäinen valinta
    const valitut = selectedMovie || selectedFromSession;


    const [rating, setRating] = useState("")     // 1-5
    const [text, setText] = useState("")        // Arvostelun teksti
    const [msg, setMsg] = useState(null)        // Onnistuminen / virhe
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMsg(null)

        if (status !== "USER") {

            // Jos käyttäjä ei ole kirjautunut -> ohjataan Sign in -sivulle
            // Mutta sitä ennen tallennetaan sessionStorageen avain "returnTo"

            // window.location.pathname -> URL:n polku-osuus (esim. /reviewform)
            // window.location.hash -> URL:n "ankkuri" (esim. #search)

            // TARKOITUS: kun käyttäjä kirjautuu onnistuneesti, voidaan lukea sessionStorage.getItem("returnTo") ja
            // ohjata takaisin juuri siihen paikkaan missä hän oli ennen redirectiä

            sessionStorage.setItem("returnTo", window.location.pathname + window.location.hash)
            navigate("/signin", { replace: true, state: { from: "reviewform" } })
            return;
        }

        if (!valitut) {
            setMsg({ type: "error", text: "Choose movie first" })
            return
        }

        const backendData = {
            movie_id: String(valitut.id),
            movie_name: valitut.title ?? "",
            movie_rating: Number(rating),
            movie_review: text.trim(),
        }

        if (!backendData.movie_name || !backendData.movie_review || !rating) {
            setMsg({ type: "error", text: "Please fill the review text" })
            return
        }

        // Haetaan JWT-token, jonka avulla backend tunnistaa käyttäjän
        const token = sessionStorage.getItem("token");

        try {
            setSubmitting(true);
            await axios.post(`${api}/reviews`, backendData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMsg({ type: "success", text: "Review has been published!" });
            setText("");
            setRating("");
            sessionStorage.removeItem("pending_review")
        } catch (err) {
            const code = err?.response?.status;

            // Jos backend palauttaa 401 Unauthorized, tallennetaan taas "returnTo" ja ohjataan login-sivulle
            if (code === 401) {
                sessionStorage.setItem("returnTo", window.location.pathname + window.location.hash);
                navigate("/signin", { replace: true, state: { flash: "Session expired. Please sign in again." } });
                return;
            }
            setMsg({ type: "error", text: "Adding review failed, you have already reviewed this movie" });
        } finally {
            setSubmitting(false);
        }
    };

    if (!valitut) {
        return <p>Choose movie from movie search.</p>;
    }



    return (
        <div className={`container mt-5 ${styles.review_wrap_container}`}>
            <h2 className={styles.headline}>Add a review:</h2>

            <form onSubmit={handleSubmit}>
                {/* Movie title (read-only) */}
                <div className="mb-3">
                    <label htmlFor="movieName" className={styles.review_form_label}>
                        Movie:
                    </label>
                    <input
                        id="movieName"
                        type='text'
                        className={`form-control ${styles.form_readonly}`}
                        value={valitut.title}
                        readOnly
                    />
                </div>

                {/* Rating */}
                <div className="mb-3">
                    <label htmlFor="rating" className={styles.review_form_label}>
                        Rating (1-5)
                    </label>
                    <select
                        id="rating"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        disabled={submitting}
                        className={`form-select ${styles.review_form_select}`}
                        required
                    >
                        <option value="" disabled>Choose rating</option>

                        {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                                {"⭐".repeat(n)} {n}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Review text */}
                <div className="mb-3">
                    <label htmlFor="reviewText" className={styles.review_form_label}>
                        What did you think about the movie?
                    </label>
                    <textarea
                        id="reviewText"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={submitting}
                        className={`form-control ${styles.review_textarea}`}
                        required
                        rows={8}
                    ></textarea>
                </div>

                {/* Submit */}
                <div className='mb-3'>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting || !valitut}

                    >
                        {submitting ? "Saving.." : "Send review"}
                    </button>
                </div>

                {msg && (
                    <p style={{ marginTop: 8, color: msg.type === "error" ? "crimson" : "green" }}>
                        {msg.text}
                    </p>
                )}

            </form>
        </div>
    )

}
