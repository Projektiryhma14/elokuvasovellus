import { useState, useEffect } from 'react'
import axios from 'axios'
import styles from './ProfileSettings.module.css'
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate } from 'react-router-dom'
import { useMemo } from "react"

export default function ProfileSettings() {

  const navigate = useNavigate()
  const { user, status, signOut } = useAuth()

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [input, setInput] = useState("")      //tekstikentälle arvo suosikkilistan luontiin
  const [favourite, setFavourite] = useState([])    //Suosikkilista taulukko
  const [users, setUsers] = useState([])          //Jaettujen käyttäjien lista (ei renderöidä täällä), vain tarkastusta varten

  const [isShared, setIsShared] = useState(false)   //Tarkistaa onko omaa listaa jaettu
  const [statusMessage, setStatusMessage] = useState("")

  const userId = useMemo(() => sessionStorage.getItem("user_id") ?? "", [])
  const userName = user?.username



  useEffect(() => {
    //Haetaan käyttäjän id SessionStoragesta
    const userId = sessionStorage.getItem('user_id')
    //Jos id:tä ei löydy
    if (!userId) {
      console.log('userId is missing')
      return
    }
    //Jos id löytyy, tekee get pyynnön, hakee käyttäjän omat suosikit
    axios.get(`${API_BASE_URL}/favourites?user_id=${userId}`)
      .then((response) => {
        setFavourite(response.data)
      })
    //Muistaa aloittaa sivun näyttämisen heti yläreunasta
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [])

  //SUOSIKIN LISÄÄMINEN
  const addFavourite = () => {
    //Poistetaan ylim. välilyönnit
    const name = input.trim()
    //Estetään tyhjän tai välilyönneistä koostuvan rivin lisääminen
    if (!name) return


    //Haetaan user_id, varmistaa että käyttäjä on kirjautunut
    const userId = sessionStorage.getItem('user_id')
    if (!userId) {
      alert('userId is missing')
      return
    }

    const headers = { headers: { Authorization: user.token } }

    const newFavourite = {
      movie_name: name,
      user_id: userId,
    }

    axios.post(`${API_BASE_URL}/favourites/create`, newFavourite, headers)
      .then(response => {
        // Palauttaa luodun rivin ja lisää sen olemassa olevan listan perään
        setFavourite([...favourite, response.data])

        //Tyhjennetään tekstikenttä
        setInput('')
      })
  }

  //SUOSIKIN POISTO
  const deleteFavourite = (deleted) => {

    //Haetaan user_id, varmistaa että käyttäjä on kirjautunut
    const userId = sessionStorage.getItem('user_id')
    if (!userId) {
      alert('userId is missing')
      return
    }

    const headers = { headers: { Authorization: user.token } }

    axios.delete(`${API_BASE_URL}/favourites/delete/${deleted}?user_id=${userId}`,
      headers
    )
      .then(() => {
        //Varmistetaan suosikin poisto niin että se päivityy näkyviin heti
        setFavourite(favourite.filter(item => item.favourites_id !== deleted))
      })
  }

  //KÄYTTÄJÄN TILIN POISTO
  const deleteUser = async () => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete your account? All of your data will be removed.")

      if (!confirmed) return

      const userId = sessionStorage.getItem("user_id");
      const response = await axios.delete(`${API_BASE_URL}/deleteuser/${userId}`)
      alert("Käyttäjä poistettu")
      signOut()
      navigate("/", { replace: true, state: { flash: "User has been deleted", from: "profile" } })


    }
    catch (err) {
      console.error(err)
    }

  }

  //SUOSIKKILISTAN JAKO
  const shareFavourites = async (e) => {
    e.preventDefault()

    try {

      const headers = { headers: { Authorization: user.token } }

      await axios.post(`${API_BASE_URL}/favourites/share`, { user_id: userId }, headers)

      //Päivitä UI heti
      setIsShared(true)

      setStatusMessage("Favourite list shared.")

      await refreshShare({ favIsShared: true })
    } catch (err) {
      const status = err?.response?.status
      const msg = err?.response?.data?.error || "Sharing failed."
      setStatusMessage(msg)

      if (status !== 409) {
        setIsShared(false)

      }
    }
  }

  //LOPETA JAKAMINEN
  const unshareFavourites = async (e) => {
    e.preventDefault()

    try {

      const headers = { headers: { Authorization: user.token } }

      await axios.post(`${API_BASE_URL}/favourites/unshare`, { user_id: userId }, headers)

      //Päivitä UI heti
      setIsShared(false)

      setStatusMessage("Favourite list sharing cancelled.")

      await refreshShare({ favIsShared: true })
    } catch (err) {
      const status = err?.response?.status
      const msg = err?.response?.data?.error || "Cancellation failed."
      setStatusMessage(msg)


      if (status !== 409) {
        setIsShared(true)
      }
    }
  }

  //PÄIVITÄ LISTAUS
  const refreshShare = async (opts = {}) => {
    const { favIsShared = false } = opts

    try {
      //Hae omat suosikit
      if (userId) {
        const fav = await axios.get(`${API_BASE_URL}/favourites?user_id=${userId}`)
        setFavourite(fav.data ?? [])
      }

      //Hae kaikki käyttäjät, jotka ovat jakaneet listansa
      const sharedFav = await axios.get(`${API_BASE_URL}/favourites/shared`)
      const favList = sharedFav.data ?? []

      //Poista duplikaatit user_id:n perusteella
      const uniqueFav = Array.from(
        new Map(favList.map(u => [String(u.user_id), u])).values()
      )

      //Päivitä lista
      setUsers(uniqueFav)

      //Päivitä oma jaon tila
      const update = uniqueFav.some(u => String(u.user_id) === String(userId))
      if (!favIsShared) {
        setIsShared(update)
      }

    } catch (err) {
      console.error("Error during update", err)
    }
  }

  useEffect(() => {
    if (!userId) return
    refreshShare()

  }, [userId, userName])


  return (


    <div className={styles.wrapper}>


      <h1 className={styles.title}>Profile settings</h1>


      <div className={styles.profile}>
        <h3>My profile</h3>
        <p><span className={styles.label}>Username:</span> {user?.username}</p>
        <p><span className={styles.label}>Email:</span> {user?.email}</p>

        <button className={styles.deletebutton} type="button" id="delete_account" onClick={() => deleteUser()}>Delete account</button>
      </div>

      <div className={styles.myfavourites}>
        <h3>My Favourites List</h3>

        <input className={styles.input}
          placeholder='My New Favourite Movie'
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addFavourite()
            }
          }}

        />
        <button className={styles.savebutton} type="button" id="add_favourite" onClick={addFavourite} >Save</button>

        <div className={styles.list}>
          <ul className={styles.favList}>

            {favourite.map((item) => (
              <li key={item.favourites_id} className={styles.li}>
                <span className={styles.moviename}>{item.movie_name}</span>
                <button className={styles.deletefavbutton} type="button" onClick={() => deleteFavourite(item.favourites_id)} >Delete</button>
              </li>
            ))}

          </ul>

          <div className={styles.shareactions}>

            <button className={styles.sharebutton}
              type="button"
              id="share_favourites"
              onClick={isShared ? unshareFavourites : shareFavourites}
            >
              {isShared ? "Undo favorite list sharing" : "Share your favorite list"}
            </button>

            {statusMessage && <p className={styles.statusmessage} role="status">{statusMessage}</p>}

          </div>

        </div>
      </div>
    </div>
  )
}
