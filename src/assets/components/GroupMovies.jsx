import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import styles from './GroupMovies.module.css'

export default function GroupMovies({ members, group }) {
    const [movies, setMovies] = useState([])
    const { id } = useParams()

    const userId = sessionStorage.getItem("user_id")

    const fetchGroupMovies = async () => {
        const base_url = import.meta.env.VITE_API_BASE_URL
        axios.get(base_url + "/sharedmovies/group/" + id)
            .then(response => {
                setMovies(response.data)
            })
            .catch(err => {
                console.error(err)
            })
    }

    const findSharerName = (sharerId) => {
        for (let i = 0; i < members.length; i++) {
            if (members[i].member_id === sharerId) {
                return members[i].member_name
            }
        }
    }

    const deleteMovie = async (sharedMovieId) => {
        console.log(sharedMovieId)
        const base_url = import.meta.env.VITE_API_BASE_URL
        try {
            const response = await axios.delete(base_url + "/sharedmovies/" + sharedMovieId)

            //refresh the shared movies list after deletion
            fetchGroupMovies()
        }
        catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchGroupMovies()
    }, [])

    return (
        <div className={(movies.length > 0) ? styles.movie_recs : styles.movie_recs_empty}>
            {(movies.length > 0) ? (<h4 className={styles.shared_movies_header}>Movie recommendations!</h4>) : ""}
            <ul>
                {movies.map(movie => {
                    const isOwner = (userId === String(group.owner_id)) //nykyinen käyttäjä on ryhmän omistaja
                    const isSharer = (userId === String(movie.sharer_id)) //nykyinen käyttäjä on elokuvan jakaja
                    return (
                        <li className={styles.movie_rec_line} key={movie.shared_movie_id}>
                            <b>{findSharerName(movie.sharer_id)}</b> recommends watching <b>{movie.movie_name}</b>
                            {(isOwner || isSharer) ? <button className={styles.movies_delete_button} onClick={() => {
                                deleteMovie(movie.shared_movie_id)
                            }}>Delete</button> : ""}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
