import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import styles from './SharedFavourites.module.css'

export default function sharedFavourites() {

  const [users, setUsers] = useState([])
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [page, setPage] = useState(1)                    // nykyinen sivu (1-pohjainen)
  const itemsPerPage = 10                                // montako itemiä näytetään per sivu

  // Lasketaan mitä indeksejä näytetään nykyisellä sivulla
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const totalPages = Math.max(1, Math.ceil(users.length / itemsPerPage))
  const currentUsers = users.slice(startIndex, endIndex)

  useEffect(() => { setPage(1); }, [users])

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/favourites/shared`)
      .then((res) => {
        const favList = res.data ?? []
        const unique = Array.from(
          new Map(favList.map(u => [String(u.user_id), u])).values()
        )
        setUsers(unique)
      })
      .catch((err) => {
        console.error("Jaettujen suosikkien haku epäonnistui:", err)
      })
  }, [])

  return (

    <section id="sharedFavourites" className={styles.sharedFavourites_wrapper}>
      <div className={styles.container_sharedFavourites}>
        <h1>Shared Favourites Lists</h1>

        <div className={styles.sharedList}>

          <ul>
            {/*Jokaisesta suosikkilistansa jakaneesta käyttäjästä, tehdään linkki heidän profiiliinsa käyttäjänimellä*/}

            {currentUsers.map((u, i) => (
              <li key={u.user_id ?? i} className={styles.li}>
                <Link to={`/profile/${encodeURIComponent(u.user_name)}`}>
                  {u.user_name}
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.buttons}>
            <button
              type="button"
              id="prev_button"
              className={styles.prevbutton}
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Prev
            </button>

            <button
              type="button"
              id="next_button"
              className={styles.nextbutton}
              onClick={() => setPage(page + 1)}
              disabled={endIndex >= users.length}

            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

