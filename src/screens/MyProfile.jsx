import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate, useParams } from 'react-router-dom'
import styles from "./MyProfile.module.css"

export default function MyProfile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { username: routeUsername } = useParams() // /profile/:username

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [favourites, setFavourites] = useState([])


  useEffect(() => {
    let userId = sessionStorage.getItem("user_id")
    const load = async () => {
      try {

        if (routeUsername && routeUsername !== user?.username) {
          const { data = [] } = await axios.get(`${API_BASE_URL}/favourites/shared`)
          const ru = routeUsername.trim().toLowerCase()
          const match = data.find(u => (u.user_name || "").trim().toLowerCase() === ru)
          if (!match) {
            setFavourites([])
            return
          }
          userId = match.user_id
        }
        if (!userId) return
        const { data = [] } = await axios.get(`${API_BASE_URL}/favourites?user_id=${userId}`)
        setFavourites(data)
      } catch (e) {
        console.error(e)
        setFavourites([])
      }
    }
    load()
  }, [])



  return (
    <div className={styles.profile}>

      <h2>{routeUsername}'s profile</h2>

      <div className={styles.inner}>
        <h3>My Favourites List:</h3>

        <ul className={styles.list}>
          {/*Näyttää backendistä favourites taulukon Axioksen avulla, map käy jokaisen alkion taulukosta. Tallennetaan muuttujaan f*/}
          {favourites.map((f) => (
            <li key={f.favourites_id} className={styles.listItem}>
              {f.movie_name}</li>

          ))}
        </ul>

      </div>
    </div>
  )
}