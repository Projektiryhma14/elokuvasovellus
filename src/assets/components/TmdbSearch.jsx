import React from 'react'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import placeholder from '../../pics/movie_poster_not_available.png'
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import styles from './TmdbSearch.module.css'



export default function TmdbSearch() {

    const navigate = useNavigate()
    const [msg, setMsg] = useState(null)                    // Onnistuminen / virhe

    const [query, setQuery] = useState("")                  // ei käytössä
    const [output, setOutput] = useState("")                // Näytetään <pre>-tagissä. APIN raaka-data (debug)

    // Filtterit (dropdown)
    const [genre, setGenre] = useState("")                  // TMDb genre-ID (esim. "28" = Action). Tyhjä = ei genrefiltteriä
    const [year, setYear] = useState('')                    // Vuosi filtteri (tyhjä = ei vuodensuodatusta)
    const [language, setLanguage] = useState('')            // Alkuperäiskieli filtteri (ISO-639-1, esim. "en","fi"; tyhjä = ei kielisuodatusta)

    // -- Data listaukseen --
    const [movies, setMovies] = useState([])                // tänne voisi tallentaa hakutulokset (nyt ei käytössä listauksessa)
    const [popularMovies, setPopularMovies] = useState([])  // käytetään "Popular now" -listaan
    const [plot, setPlot] = useState("")                    // valitun elokuvan juoni (oikean laatikon sisältö tulevaisuudessa)

    // -- Sivutus “näytä 10 kerrallaan” --
    const [page, setPage] = useState(1);                    // nykyinen sivu (1-pohjainen)
    const itemsPerPage = 10;                                // montako itemiä näytetään per sivu

    // Lasketaan mitä indeksejä näytetään nykyisellä sivulla
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Leikataan näkyviin tuleva pätkä popularMovies-taulukosta
    const currentMovies = popularMovies.slice(startIndex, endIndex);

    const [movieDetails, setMovieDetails] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState("")

    // MOVIE SEARCH OSIO !!!!!
    // Suoritetaan kun käyttäjä painaa "Search" (form on submit)
    const searchMovie = async () => {
        try {
            const res = await axios.get("https://api.themoviedb.org/3/discover/movie", {
                params: {
                    api_key: import.meta.env.VITE_API_KEY,        // v3 API key
                    include_adult: false,
                    language: "en-US",      // UI-teksti suomeksi, jos on saatavilla
                    with_original_language: language || undefined,
                    with_genres: genre || undefined,
                    primary_release_year: year || undefined,
                    page: 1,
                },
            });
            setMovies(res.data.results || []);                      // Tallennetaan dropdown valinnat listaan.
            setPopularMovies(res.data.results || []);
            console.log(res.data.results);                          // debug (näkyy konsolissa)
            setOutput(JSON.stringify(res.data.results, null, 2));   // raakadata <pre>-näyttöön (debugia varten)
        } catch (err) {
            console.error(err);
        }
    }

    // Käytetään useEfectiä, eli haetaan vain kerran, kun komponentti ladataan
    // Ladataan popular movies listaan
    useEffect(() => {
        const noudaPopular = async () => {
            try {
                const { data } = await axios.get(
                    "https://api.themoviedb.org/3/trending/movie/day",
                    {

                        params: {
                            api_key: import.meta.env.VITE_API_KEY,
                            language: "en-US",
                        },
                    }
                );
                setPopularMovies(data.results || []);           // tallennetaan popular-lista stateen, palauttaa max 20 itemiä
            } catch (err) {
                console.error("Popular-elokuvien haku epäonnistui:", err);
            }
        };

        noudaPopular();     // kutsutaan heti
    }, []);                 // Ei uudelleen hae state-muutoksissa

    //Funktio jolla muutetaan TMDB- vote_average tähdiksi
    function NaytaTahdet({ vote_average, maxStars = 5 }) {
        const rating = (vote_average / 10) * maxStars;
        const filledStars = Math.floor(rating);
        const hasHalfStar = rating - filledStars >= 0.5;

        return (
            <div className='vote_stars'>
                {[...Array(maxStars)].map((_, i) => {
                    if (i < filledStars) {
                        return <FaStar key={i} color="gold" />
                    } else if (i === filledStars && hasHalfStar) {
                        return <FaStarHalfAlt key={i} color="gold" />
                    } else {
                        return <FaRegStar key={i} color="gold" />
                    }
                })}
            </div>
        )
    }

    return (
        <>

            {/* MOVIE SEARCH -OSIO */}
            <div id="movie_search" className={styles.wrapper}>
                <section className={styles.container_movieSearch}>
                    <span className={styles.headline}><h2>Movie Search</h2></span>


                    <div className={styles.tmdb_container}>
                        {/* VASEN: Suodattimet */}
                        <aside className={styles.search_box}>
                            <form className={styles.search_form} onSubmit={e => { e.preventDefault(); searchMovie(); }}>
                                <div className={styles.select_div}>
                                    <select value={genre} onChange={(e) => { setGenre(e.target.value); console.log(e.target.value) }}>
                                        <option className={styles.search_criteria} value="">Choose genre</option>
                                        <option value="28">Action</option>
                                        <option value="12">Adventure</option>
                                        <option value="16">Animation</option>
                                        <option value="35">Comedy</option>
                                        <option value="80">Crime</option>
                                        <option value="99">Documentary</option>
                                        <option value="18">Drama</option>
                                        <option value="10751">Family</option>
                                        <option value="14">Fantasy</option>
                                        <option value="36">History</option>
                                        <option value="27">Horror</option>
                                        <option value="10402">Music</option>
                                        <option value="9648">Mystery</option>
                                        <option value="10749">Romance</option>
                                        <option value="878">Science Fiction</option>
                                        <option value="10770">TV Movie</option>
                                        <option value="53">Thriller</option>
                                        <option value="10752">War</option>
                                        <option value="37">Western</option>
                                    </select>
                                </div>

                                <div className={styles.select_div}>
                                    <select value={year} onChange={(e) => { setYear(e.target.value); console.log(e.target.value) }}>
                                        <option className={styles.search_criteria} value="">Choose year</option>
                                        {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => {
                                            const y = new Date().getFullYear() - i;
                                            return <option key={y} value={y}>{y}</option>;
                                        })}
                                    </select>
                                </div>

                                <div className={styles.select_div}>
                                    <select value={language} onChange={(e) => { setLanguage(e.target.value); console.log(e.target.value) }}>
                                        <option className={styles.search_criteria} value="">Choose language</option>
                                        <option value="en">English</option>
                                        <option value="fi">Finnish</option>
                                        <option value="sv">Swedish</option>
                                        <option value="ja">Japanese</option>
                                        <option value="fr">French</option>
                                        <option value="es">Spanish</option>
                                        <option value="de">German</option>
                                    </select>
                                </div>

                                <br />
                                <button type="submit" className={styles.search_button}>Search</button>



                            </form>
                        </aside>

                        {/* KESKI: Lista + sivutus */}
                        <section className={styles.popular_box} aria-labelledby="results-heading">
                            <h3 className={styles.results_heading}>
                                {movies.length > 0 ? "Search Results" : "Popular Movies Today"}
                            </h3>

                            <ul>
                                {currentMovies.map((m) => {
                                    const year = m.release_date?.slice(0, 4) || "—";
                                    return (
                                        <li
                                            key={m.id}
                                            onClick={() => {
                                                setSelectedMovie(m);
                                                setMsg(null);   // tyhjennetään mahdollinen varoitusviesti
                                            }}
                                        >
                                            {m.title} ({year})
                                        </li>
                                    );
                                })}

                                <div className={styles.next_prev}>
                                    <button
                                        type="button"
                                        id="prev_button"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                    >
                                        Edelliset
                                    </button>

                                    <button
                                        type="button"
                                        id="next_button"
                                        onClick={() => setPage(page + 1)}
                                        disabled={endIndex >= popularMovies.length}
                                    >
                                        Seuraavat
                                    </button>
                                </div>
                            </ul>


                        </section>

                        {/* OIKEA: kääritään yhteen */}
                        <div className={styles.rightColumn}>
                            {/* Valittu elokuva */}
                            <article className={styles.movieResult_box} aria-labelledby="selected-movie-heading">
                                <h3 className={styles.selected_movie_heading}>Selected movie</h3>
                                <div>{selectedMovie.title}</div>

                                <div>
                                    <img
                                        className={styles.poster}
                                        src={
                                            selectedMovie.poster_path
                                                ? `https://image.tmdb.org/t/p/w342${selectedMovie.poster_path}`
                                                : placeholder
                                        }
                                        alt={selectedMovie.title}
                                    />
                                </div>

                                <div className={styles.vote_stars}>
                                    <NaytaTahdet vote_average={selectedMovie.vote_average} />
                                </div>
                            </article>

                            {/* Kuvaus */}
                            <section className={styles.overview_box} aria-labelledby="overview-heading">
                                <h3 className={styles.overview_heading}>Overview</h3>
                                {selectedMovie.overview}

                                <div id="leave_review">
                                    {/*<button onClick={() => navigate("/reviewform", { state: { selectedMovie } })}>Arvostele leffa</button>*/}
                                    <button onClick={() => {
                                        if (!selectedMovie || !selectedMovie.id) {
                                            setMsg("Valitse ensin elokuva ennen kuin voit antaa arvostelun.");
                                            return
                                        }

                                        // Tallennetaan tiedot sessioon
                                        const leffaTiedot = {
                                            movie_id: selectedMovie.id,
                                            movie_title: selectedMovie.title,
                                            poster_path: selectedMovie.poster_path ?? null,
                                            vote_average: selectedMovie.vote_average ?? null,
                                        }

                                        // JSON.stringify -> muuttaa objektin JSON-muotoiseksi merkkijonoksi
                                        // Tämän sessionStorage osaa tallentaa
                                        sessionStorage.setItem("pending_review", JSON.stringify(leffaTiedot))

                                        // Menee reviewformiin; jos ei ole kirjautunut, gate ohjaa SignIniin
                                        navigate("/reviewform")
                                    }}
                                    >Arvostele leffa</button>
                                    {msg && (
                                        <p style={{ color: "red", marginTop: "0.5rem", fontStyle: "bold" }}>
                                            {msg}
                                        </p>
                                    )}

                                </div>


                            </section>
                        </div>
                    </div>
                </section >
            </div >
        </>
    )
}

