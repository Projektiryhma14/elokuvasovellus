import React, { useState, useEffect } from 'react'
import axios from 'axios'
import FavouritesList from '../assets/components/FavouritesList.jsx'
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate } from 'react-router-dom'
import { useMemo } from "react";

export default function ProfileSettings() {

  const navigate = useNavigate()

  const { user, status, signOut } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [input, setInput] = useState("")      //tekstikentälle arvo
  const [favourite, setFavourite] = useState([])    //Suosikkilista taulukko


  useEffect(() => {
    //Haetaan käyttäjän id SessionStoragesta
    const userId = sessionStorage.getItem('user_id')
    //Jos id:tä ei löydy
    if (!userId) {
      console.log('userId puuttuu')
      return
    }
    //Jos id löytyy, tekee get pyynnön, hakee käyttäjän suosikit
    axios.get(`${API_BASE_URL}/favourites?user_id=${userId}`)
      .then((response) => {
        setFavourite(response.data)
      })
  }, [])

  //SUOSIKIN LISÄÄMINEN
  const addFavourite = () => {
    //Poistetaan ylim. välilyönnit
    const name = input.trim()
    //Estetään tyhjän tai välilyönneistä koostuvan rivin lisääminen
    if (!name) return


    //Haetaan user_id, varmistetaan että tieto tallentuu vain tälle käyttäjälle
    const userId = sessionStorage.getItem('user_id');
    if (!userId) {
      alert('user_id puuttuu');
      return;
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

    const userId = sessionStorage.getItem('user_id');
    if (!userId) {
      alert('user_id puuttuu');
      return;
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

      if(!confirmed) return

      const userId = sessionStorage.getItem("user_id");
      const response = await axios.delete(`${API_BASE_URL}/deleteuser/${userId}`)
      alert("Käyttäjä poistettu")
      signOut()
      navigate("/", { replace: true, state: { flash: "User has been deleted", from: "profile" } });


    }
    catch (err) {
      console.error(err)
    }

  }
  

  return (


    <div>
      <div>

        <h2>My profile settings</h2>
        <p>Käyttäjä: {user?.username}</p>
        <p>Email: {user?.email}</p>
      </div>

      <button type="button" id="delete_account" onClick={() => deleteUser()}>Delete account</button>

      <div id="container">
        <h3>My Favourite List</h3>
        <input
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
        <ul>
          {
            favourite.map(item => (
              <FavouritesList
                item={item}
                key={item.favourites_id}
                deleteFavourite={deleteFavourite} />
            ))
          }
        </ul>
      </div>
    </div>
  )
}
