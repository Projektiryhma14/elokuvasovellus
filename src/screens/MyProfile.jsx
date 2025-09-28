import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate } from 'react-router-dom'

export default function MyProfile() {
    const navigate = useNavigate()
    const { user } = useAuth();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

    const [favourites, setFavourites] = useState([]);

    useEffect(() => {
        const userId = sessionStorage.getItem("user_id");
        if (!userId) return;

        axios
            .get(`${API_BASE_URL}/favourites?user_id=${userId}`)
            .then((res) => setFavourites(res.data));
    }, []);



    return (
        <div>
            <h2>{user?.username}'s profile</h2>
            <h3>My Favourite List:</h3>
            <ul>

                {/*Näyttää backendistä favourites taulukon Axioksen avulla, map käy jokaisen alkion taulukosta. Tallennetaan muuttujaan f*/}
                {favourites.map((f) => (
                    <li key={f.favourites_id}>{f.movie_name}</li>
                ))}
            </ul>


        </div>
    )
}