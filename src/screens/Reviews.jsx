import axios from 'axios'
import { useState } from 'react'
import { useEffect } from 'react'
import styles from './Reviews.module.css'
import { HashLink } from 'react-router-hash-link'
import { FaRegStar, FaStar } from 'react-icons/fa'

export default function Reviews() {
    const base_url = "http://localhost:3001"
    const [reviews, setReviews] = useState([])

    const fetchMovieDetails = async (id) => {
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

    useEffect(() => {
        const fetchReviews = async () => {
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
        fetchReviews()

    }, [])

    return (
        <div>
            <h1>Reviews</h1>
            {/*
            <p>Vaihtoehto 1: table</p>
            <table>
                <thead>
                    <tr>
                        <th>Review id</th>
                        <th>Movie name</th>
                        <th>Movie id</th>
                        <th>Movie rating</th>
                        <th>Movie review</th>
                        <th>Timestamp</th>
                        <th>Reviewer id</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map(item => (
                        <tr key={item.review_id}>
                            <th>{item.review_id}</th>
                            <th>{item.movie_name}</th>
                            <th>{item.movie_id}</th>
                            <th>{item.movie_rating}</th>
                            <th>{item.movie_review}</th>
                            <th>{item.created_at}</th>
                            <th>{item.user_id}</th>
                        </tr>
                    ))}
                </tbody>
            </table>
            */}
            <br></br>
            {/*<p>Vaihtoehto 2: lista</p>*/}
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
                                {/*
                                <Link to="/#search">
                                    {item.movie_name}
                                </Link>
                                */}
                                
                            </li>
                            <li key={item.review_id + item.movie_rating}>
                                {ratingStars(item.movie_rating)}
                            </li>
                            {/*<li key={item.review_id + item.movie_review}>{item.movie_review}</li>*/}
                        </ul>
                        <p className={styles.review_text}>{item.movie_review}</p>
                    </div>
                )
            })}
        </div>
    )
}
