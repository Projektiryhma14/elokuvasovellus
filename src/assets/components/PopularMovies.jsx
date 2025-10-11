import React from 'react'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import placeholder from '../../pics/movie_poster_not_available.png'
import styles from './PopularMovies.module.css'




export default function PopularMovies() {

    // Trending-data
    const [popularMovies, setPopularMovies] = useState([])  // käytetään "Popular now" -listaan

    // sivutus
    const [page, setPage] = useState(1);                    // nykyinen sivu (1-pohjainen)
    const itemsPerPage = 10;                                // montako itemiä näytetään per sivu
    const startIndex = (page - 1) * itemsPerPage;           // Lasketaan mitä indeksejä näytetään nykyisellä sivulla
    const endIndex = startIndex + itemsPerPage;
    const currentMovies = popularMovies.slice(startIndex, endIndex)


    // Valittu elokuva
    const [selectedMovie, setSelectedMovie] = useState("")





    // =========== Nouda popular ============ //

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
                const result = data?.results ?? [];
                setPopularMovies(result);

                if (result.length > 0) {
                    setSelectedMovie(result[0])
                }



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


    //const title = selectedMovie?.title ?? "";
    //const poster_path = selectedMovie?.poster_path ?? null;
    //const overview = selectedMovie?.overview ?? "";


    // ====== HTML ====== //

    return (
        <section id="popular_movies" className={styles.wrapper}>

            <h2 className={styles.title}>Popular movies today</h2>

            {/* Vasemmanpuoleinen sarake: lista + sivutus */}
            <div className={styles.listArea}>
                <section className={styles.popular_box}>
                    <ul className={styles.resultList}>
                        {currentMovies.map((m) => {
                            const year = m.release_date?.slice(0, 4) || "—";
                            return (
                                <li key={m.id} className={styles.resultItem}>
                                    <button
                                        type="button"
                                        className={`${styles.resultButton} ${selectedMovie?.id === m.id ? styles.resultButtonActive : ""
                                            }`}
                                        onClick={() => {
                                            setSelectedMovie(m);
                                            sessionStorage.setItem("selected_movie", JSON.stringify(m));
                                        }}
                                    >
                                        {m.title} ({year})
                                    </button>
                                </li>

                            );
                        })}
                    </ul>

                    {/* Sivutusnapit */}
                    <nav className={styles.next_prev}>
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
                            disabled={endIndex >= popularMovies.length}
                        >
                            Next
                        </button>
                    </nav>
                </section>
            </div>

            {/* Oikeanpuoleinen sarake: juliste, tähdet ja overview */}
            <div className={styles.detailPanel}>
                <article className={styles.movieResult_box}>
                    {/*
                    <header>
                        <h3 className={styles.selected_movie_heading}>
                            {selectedMovie.title || "-"}
                        </h3>
                    </header>
                        */}
                    <figure className={styles.posterWrap}>
                        <img
                            className={styles.poster}
                            src={
                                selectedMovie.poster_path
                                    ? `https://image.tmdb.org/t/p/w342${selectedMovie.poster_path}`
                                    : placeholder
                            }
                            alt={
                                selectedMovie.title
                                    ? `Poster: ${selectedMovie.title}`
                                    : "Poster not available"
                            }
                            loading="lazy"
                        />
                        <figcaption className={styles.vote_stars}>
                            <NaytaTahdet vote_average={selectedMovie?.vote_average ?? 0} />
                        </figcaption>
                    </figure>

                    <section className={styles.overview_box}>
                        <h4 className={styles.overview_heading}>Overview</h4>
                        <p className={styles.overview_text}>
                            {selectedMovie.overview || "No overview available"}
                        </p>
                    </section>
                </article>
            </div>

        </section>
    )
}

