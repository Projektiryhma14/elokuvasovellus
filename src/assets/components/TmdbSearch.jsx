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

    //const [query, setQuery] = useState("")                  // ei käytössä
    //const [output, setOutput] = useState("")                // Näytetään <pre>-tagissä. APIN raaka-data (debug)

    // Filtterit (dropdown)
    const [genre, setGenre] = useState("")                  // TMDb genre-ID (esim. "28" = Action). Tyhjä = ei genrefiltteriä
    const [year, setYear] = useState('')                    // Vuosi filtteri (tyhjä = ei vuodensuodatusta)
    const [language, setLanguage] = useState('')            // Alkuperäiskieli filtteri (ISO-639-1, esim. "en","fi"; tyhjä = ei kielisuodatusta)

    // -- Data listaukseen --
    const [movies, setMovies] = useState([])                // tänne voisi tallentaa hakutulokset (nyt ei käytössä listauksessa)
    const [selectedMovie, setSelectedMovie] = useState({})

    // -- Sivutus “näytä 10 kerrallaan” --
    const [page, setPage] = useState(1);                    // nykyinen sivu (1-pohjainen)
    const itemsPerPage = 10;                                // montako itemiä näytetään per sivu

    // Lasketaan mitä indeksejä näytetään nykyisellä sivulla
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    //const currentMovies = source.slice(startIndex, endIndex)
    const currentMovies = movies.slice(startIndex, endIndex);
    //const [movieDetails, setMovieDetails] = useState([]);


    // Leikataan näkyviin tuleva pätkä popularMovies-taulukosta
    //const currentMovies = source.slice(startIndex, endIndex)

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

    /*UUSI HAKUFUNKTIO*/
    const searchMovie = async () => {
        try {
            // kootaan vain aktiiviset parametrit
            const params = {
                api_key: import.meta.env.VITE_API_KEY,
                include_adult: false,
                language: "en-US",
                page: 1,
            };
            if (language) params.with_original_language = language;
            if (genre) params.with_genres = genre;
            if (year) params.primary_release_year = year;

            const { data } = await axios.get("https://api.themoviedb.org/3/discover/movie", { params });
            const results = data?.results ?? [];
            console.log("Search result count", data.results?.length);
            setMovies(results);
            setPage(1);

            if (results.length > 0) {
                setSelectedMovie(results[0])
                setMsg(null)
            } else {
                setSelectedMovie({})
            }

            //setIsSearchActive(true)                 // asetetaan hakutila päälle

        } catch (err) {
            console.log("Search failed:", err)
        }
    };

    const shareMovie = async (movie) => {
        console.log(movie)
        let responseGroupId = null
        //check if user is logged in
        if (!sessionStorage.getItem("user_id")) {
            console.log("sessionStoragesta ei löytynyt kenttää 'user_id' (kirjaudu sisään jatkaaksesi)")
            alert("You must be logged in to use this feature")
            return
        }
        //check if user belongs to a group
        const get_url = import.meta.env.VITE_API_BASE_URL + "/users/" + sessionStorage.getItem("user_id")
        console.log(get_url)
        try {
            const response = await axios.get(get_url)
            console.log(response.data)
            if (!response.data.groupid) {
                console.log("user is not a in a group")
                alert("You must belong to a group to use this feature")
                return
            }
            responseGroupId = response.data.groupid
        }
        catch (err) {
            console.error(err)
            alert("An error occurred.")
            return
        }

        try {
            //tässä kohtaa on varmistettu, että käyttäjä on kirjautunut sisään ja kuuluu ryhmään
            const post_url = import.meta.env.VITE_API_BASE_URL + "/sharedmovies"
            console.log(post_url)
            //console.log(movie.title)
            //console.log(sessionStorage.getItem("user_id"))
            //console.log(responseGroupId)
            const params = {
                movieName: movie.title,
                groupId: responseGroupId,
                sharerId: sessionStorage.getItem("user_id")
            }
            const responseFromPost = await axios.post(post_url, params)
            console.log(responseFromPost)

            if (responseFromPost.status === 201) {
                alert(`The following movie has been shared to your group page:
                    ${responseFromPost.data.movie_name}`)
            }
            else {
                alert("An error occurred.")
            }
        }
        catch (err) {
            console.error(err)
            //console.log(err.response.data)
            if (!err || !err.response || !err.response.data || !err.response.data.error) {
                alert("An error occurred")
            }
            else if (err.response.data.error === 'duplicate key value violates unique constraint \"unique_movie\"') {
                alert("Movie has already been added to your group page!")
            }
            else {
                alert("An error occurred")
            }
        }
    }

    return (
        <>

            {/* MOVIE SEARCH -OSIO */}
            <div id="movie_search" className={styles.wrapper}>
                <section className={styles.container_movieSearch}>
                    <h2 className={styles.headline}>Movie Search</h2>


                    {/* GRID: Filters | Results | Detail */}
                    <div className={styles.tmdb_container}>
                        {/* Filtterit */}
                        <aside className={styles.search_box}>
                            <form className={styles.search_form} onSubmit={e => { e.preventDefault(); searchMovie(); }}>
                                <div className={styles.select_div}>
                                    {/*genre*/}
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

                                {/*year*/}
                                <div className={styles.select_div}>
                                    <select value={year} onChange={(e) => { setYear(e.target.value); console.log(e.target.value) }}>
                                        <option className={styles.search_criteria} value="">Choose year</option>
                                        {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => {
                                            const y = new Date().getFullYear() - i;
                                            return <option key={y} value={y}>{y}</option>;
                                        })}
                                    </select>
                                </div>

                                {/*langauge*/}
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

                        <section className={styles.results}>
                            <h3 className={styles.results_heading}>
                                {movies.length > 0 ? "Search Results" : "No filters yet - try filters and Search"}
                            </h3>

                            <ul className={styles.resultsList}>
                                {currentMovies.map((m) => {
                                    const year = m.release_date?.slice(0, 4) || "—";
                                    const active = selectedMovie?.id === m.id;
                                    return (
                                        <li key={m.id} className={styles.resultItem}>
                                            <button
                                                type="button"
                                                className={`${styles.resultButton} ${active ? styles.resultButtonActive : ""}`}
                                                onClick={() => {
                                                    setSelectedMovie(m);
                                                    sessionStorage.setItem("selected_movie", JSON.stringify(m))
                                                    setMsg(null);   // tyhjennetään mahdollinen varoitusviesti
                                                }}
                                            >
                                                {m.title} ({year})
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>

                            <nav className={styles.pagination}>
                                <button
                                    type="button"
                                    className={styles.prev_button}
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                >
                                    Prev
                                </button>

                                <button
                                    type="button"
                                    className={styles.next_button}
                                    onClick={() => setPage(page + 1)}
                                    disabled={endIndex >= movies.length}
                                >
                                    Next
                                </button>
                            </nav>
                        </section>



                        {/* Detail -> Valittu elokuva */}
                        <section className={styles.detail}>
                            <article className={styles.detailArticle}>
                                <header className={styles.detailHeader}>
                                    <h3 id='selected-title' className={styles.selected_movie_heading}>
                                        {selectedMovie.title || "--"}
                                    </h3>
                                </header>

                                <figure className={styles.posterWrap}>
                                    <img
                                        className={styles.poster}
                                        src={
                                            selectedMovie.poster_path
                                                ? `https://image.tmdb.org/t/p/w342${selectedMovie.poster_path}`
                                                : placeholder
                                        }
                                        alt={selectedMovie.title || "Poster not available"}
                                        loading='lazy'
                                    />


                                    <figcaption className={styles.vote_stars}>
                                        <NaytaTahdet vote_average={selectedMovie?.vote_average ?? 0} />
                                    </figcaption>
                                </figure>


                                {/* Kuvaus */}
                                <section className={styles.overview}>
                                    <h4 className={styles.overview_heading}>Overview</h4>
                                    <p className={styles.overview_text}>
                                        {selectedMovie.overview || "No overview available"}
                                    </p>


                                    <div id="leave_review" className={styles.actions}>
                                        <button
                                            className={styles.rateButton}
                                            onClick={() => {
                                                if (!selectedMovie || !selectedMovie.id) {
                                                    setMsg("Choose a movie first before you can submit a review.");
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
                                        >
                                            Rate the movie
                                        </button>

                                        <button
                                            className={styles.shareButton}
                                            onClick={() => { shareMovie(selectedMovie) }}>
                                            Share to group page
                                        </button>

                                    </div>
                                    <div>
                                        {msg && (
                                            <p style={{ color: "red", marginTop: "0.5rem", fontStyle: "bold" }}>
                                                {msg}
                                            </p>
                                        )}
                                    </div>


                                </section>
                            </article>
                        </section>
                    </div>
                </section>
            </div>



        </>
    )
}



// MOVIE SEARCH OSIO !!!!!
// Suoritetaan kun käyttäjä painaa "Search" (form on submit)

/* VANHA HAKUFUNKTIO
const searchMovie = async () => {
    try {
        const res = await axios.get("https://api.themoviedb.org/3/discover/movie", {
                    params: {
                    api_key: import.meta.env.VITE_API_KEY,        // v3 API key
                include_adult: false,
                language: "en-US",      // UI-teksti suomeksi, jos on saatavilla
                page: 1,
                with_original_language: language || undefined,
                with_genres: genre || undefined,
                primary_release_year: year || undefined,
            },

        });
                //setMovies(res.data.results || []);                      // Tallennetaan dropdown valinnat listaan.
                //setPopularMovies(res.data.results || []);

                // Kirjoitetaan hakutulokset VAIN movies-tilaan (popularMovies pidetään erikseen muistissa)
                setMovies(res.data.results || [])
                setPage(1)                                              // Sivustus alkaa alusta hakutilassa

                console.log(res.data.results);                          // debug (näkyy konsolissa)
                setOutput(JSON.stringify(res.data.results, null, 2));   // raakadata <pre>-näyttöön (debugia varten)
    } catch (err) {
                        console.error(err);
    }
}
                    */

/*
// RESET / SHOW TRENDING
const resetToTrending = async () => {
                        setGenre("");
                    setYear("");
                    setLanguage("");
                    setMovies([]);
                    setPage(1);
                    setIsSearchActive(false)        // Palaaminen trendingiin

                    try {
        // Haetaan uudelleen trending-lista, jotta on ajantasainen
        const {data} = await axios.get("https://api.themoviedb.org/3/trending/movie/day", {
                        params: {
                        api_key: import.meta.env.VITE_API_KEY,
                    language: "en-US",
            },
        });
                    setPopularMovies(data.results || []);
                    console.log("Trending refreshed:", data.results?.length);
    } catch (err) {
                        console.error("Trending refresh failed:", err);
    }
}
                    */

// Käytetään useEfectiä, eli haetaan vain kerran, kun komponentti ladataan
// Ladataan popular movies listaan
{/*
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


        if (sessionStorage.getItem("selected_movie")) {
            console.log("elokuva haettu sessionstoragesta")
            setSelectedMovie(JSON.parse(sessionStorage.getItem("selected_movie")))
        }
    }, []);                 // Ei uudelleen hae state-muutoksissa

    */}
