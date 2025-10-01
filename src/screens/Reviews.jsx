import axios from 'axios'
import { useState } from 'react'
import { useEffect } from 'react'
import styles from './Reviews.module.css'
import { HashLink } from 'react-router-hash-link'
import { FaRegStar, FaStar } from 'react-icons/fa'

export default function Reviews() {
    const base_url = "http://localhost:3001"
    const [reviews, setReviews] = useState([])
    const [movies, setMovies] = useState([])

    const fetchMovieDetails = async (id) => {
        /*
        haetaan tmdb-apista klikatun elokuvan tiedot ja tallennetaan
        ne sessionstorageen, jotta elokuvan nimeä klikkaamalla
        voidaan tarkastella elokuvan tietoja (tmdbsearchissa)
        */
        const tmdb_api_url = "https://api.themoviedb.org/3/movie/" + id
        const params = {
            params: {
                api_key: import.meta.env.VITE_API_KEY,
                language: "en-US"
            }
        }
        console.log(tmdb_api_url)
        axios.get(tmdb_api_url, params)
           .then(response => {
               console.log(response.data)
               sessionStorage.setItem("selected_movie", JSON.stringify(response.data))
               //return response.data
           })
           .catch(err => {
               console.error(err)
           })
    }

    const ratingStars = (movieRating) => {
        //käytetty pohjana TmdbSearch/NaytaTahdet -funktiota

        const maxStars = 5
        const minStars = 1

        if (movieRating > maxStars || movieRating < minStars) {
            return (<div>N/A</div>)
        }
        const filledStars = movieRating
        //const emptyStars = maxStars - filledStars
        
        return (
            <div className='vote_stars'>
                {Array.from({length: maxStars}, (_, i) => {
                    if (i<filledStars) {
                        return <FaStar key={i} color="gold" />
                    }
                    else {
                        return <FaRegStar key={i} color="gold" />
                    }
                })}
            </div>
        )
    }

    const filterReviews = (movieId) => {
        /*
        funktiota kutsutaan, kun dropdown valikosta valitaan elokuva.
        Jos klikataan All movies, movieId-parametri saa arvon ""
        -> fetchReviews-funktiota kutsutaan ilman parametria
        Muussa tapauksessa movieId saa arvoksi elokuvan id:n,
        ja fetchReviews funktiota kutsutaan sillä id:llä
        */
        if (movieId === "") {
            fetchReviews()
            return
        }
        fetchReviews(movieId)
        const tempArray = []
        reviews.forEach(review => {
            if (review.movie_id == movieId) {
                tempArray.push(review)
            }
            //console.log(review.movie_id)
            //console.log(movieId)
        })
        setReviews(tempArray)
    }

    const fetchReviews = async (movieId) => {
        /*
        hakee arvostelut tietokannasta. jos funktiota kutsutaan 
        ilman parametria, haetaan tietokannasta kaikki arvostelut.
        Jos parametrina on jokin elokuvan id, haetaan vain kyseisen
        elokuvan arvostelut
        */
        if (!movieId) {
            axios.get(base_url + "/reviews")
                .then(response => {
                    //console.log(response)
                    console.log(response.data)
                    setReviews(response.data)
                })
                .catch(err => {
                    console.error(err)
                })
        }
        else {
            axios.get(base_url + "/reviews/" + movieId)
                .then(response => {
                    console.log(response.data)
                    setReviews(response.data)
                })
                .catch(err => {
                    console.error(err)
                })
        }
    }

    useEffect(() => {

        const fetchMovies = async () => {
            /*
            funktio on määritelty useEffectin sisällä,
            sillä sitä tarvitaan vain kerran.
            Funktio hakee tietokannasta listan elokuvista,
            joille on jätetty arvosteluja
            */
            axios.get(base_url + "/reviews/movies")
                .then(response => {
                    console.log("fetchmovies...")
                    console.log(response.data)
                    setMovies(response.data)
                })
                .catch(err => {
                    console.error(err)
                })
        }

        fetchReviews()
        fetchMovies()

    }, [])

    return (
        <div>
            <h1>Reviews</h1>
            <br></br>
            {/* arvostelujen filtteröinti elokuvan perusteella */}
            <select 
                className={styles.movie_select}
                onChange={e => {console.log(e.target.value); filterReviews(e.target.value)}}
            >
                <option value="">All movies</option>
                {movies.map(movie => (
                    <option key={movie.movie_id} value={movie.movie_id}>{movie.movie_name}</option>
                ))}
            </select>
            {reviews.map(item => {
                return (
                    <div className={styles.review_div} key={item.review_id}>
                        <ul key={item.review_id} className={styles.review_ul}>
                            <li key={item.review_id + item.email}>
                                {item.email}
                            </li>
                            <li key={item.review_id + item.created_at}>
                                {item.created_at}
                            </li>
                            <li key={item.review_id + item.movie_name} 
                            onClick={
                                (e) => {
                                    e.preventDefault()
                                    console.log(item.movie_id)
                                    fetchMovieDetails(item.movie_id)
                                }
                            }>
                                <HashLink smooth to="/#movie_search">
                                    {item.movie_name}
                                </HashLink>
                            </li>
                            <li key={item.review_id + item.movie_rating}>
                                {ratingStars(item.movie_rating)}
                            </li>
                        </ul>
                        <p className={styles.review_text}>{item.movie_review}</p>
                    </div>
                )
            })}
        </div>
    )
}
