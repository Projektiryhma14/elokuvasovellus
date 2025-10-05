import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import styles from './FinnkinoSearch.module.css'


export default function FinnkinoSearch() {


    // finnkino hakuun tarvittavat tilamuuttujat
    const [finnkinoMovies, setFinnkinoMovies] = useState([])
    const [selectedFinnkinoMovie, setSelectedFinnkinoMovie] = useState('')
    const [finnkinoTheatres, setFinnkinoTheatres] = useState([])
    const [selectedTheatre, setSelectedTheatre] = useState('')
    const [selectedDate, setSelectedDate] = useState('')
    const [finnkinoShowtimes, setFinnkinoShowtimes] = useState([])

    const [infotext, setInfotext] = useState("")

    //finnkino-hakuun tarvittavat funktiot
    const getFinnkinoTheatres = async () => {
        try {
            const url = "https://www.finnkino.fi/xml/TheatreAreas/"
            const response = await axios.get(url)
            const xml = response.data
            const parser = new DOMParser()
            const xmlDoc = parser.parseFromString(xml, 'application/xml')
            const root = xmlDoc.children
            const theatres = root[0].children
            const tempArray = []
            for (let i = 0; i < theatres.length; i++) {
                tempArray.push(
                    {
                        "id": theatres[i].children[0].innerHTML,
                        "name": theatres[i].children[1].innerHTML
                    }
                )
            }
            setFinnkinoTheatres(tempArray)
        }
        catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        getFinnkinoTheatres();
        getFinnkinoMovies();
    }, []);

    const getFinnkinoMovies = async () => {
        try {
            const url = "https://www.finnkino.fi/xml/Events/"
            const response = await axios.get(url)
            const xml = response.data
            const parser = new DOMParser()
            const xmlDoc = parser.parseFromString(xml, 'application/xml')
            const root = xmlDoc.children
            const events = root[0].children
            const tempArray = []
            for (let i = 0; i < events.length; i++) {
                // tarkistetaan, että event on elokuva (eikä esim live-tapahtuma)
                if (events[i].children[12].innerHTML === "Movie") {
                    tempArray.push({
                        "id": events[i].children[0].innerHTML,
                        "name": events[i].children[1].innerHTML
                    })
                }
            }
            setFinnkinoMovies(tempArray)
        }
        catch (err) {
            console.error(err)
        }
    }

    const searchShowtimes = () => {
        const theatreId = selectedTheatre
        const movieId = selectedFinnkinoMovie
        const dt = selectedDate
        //console.log(dt)
        const base_url = "https://www.finnkino.fi/xml/Schedule/"
        let full_url = base_url + "?area=" + theatreId + "&dt=" + dt + "&eventID=" + movieId
        if (dt === "") {
            console.log("päivämäärää ei annettu, näytetään näytösajat seuraavan viikon ajalta")
            full_url = full_url + "&nrOfDays=" + 7
        }
        axios.get(full_url)
            .then(response => {
                const xml = response.data
                const parser = new DOMParser()
                const xmlDoc = parser.parseFromString(xml, 'application/xml')
                const root = xmlDoc.children
                const showtimes = root[0].children[1]
                if (showtimes.children.length === 0) {
                    //jos näytösaikoja ei löytynyt annetuilla kriteereillä
                    setFinnkinoShowtimes()
                    console.log("0 showtimes with chosen filters")
                    return
                }
                //console.log(showtimes)
                //console.log(showtimes.children.length)
                //console.log(showtimes.children[0])
                //console.log(showtimes.children[0].children[2].innerHTML)
                //console.log(showtimes.children[0].children[15].innerHTML) //movie name
                //console.log(showtimes.children[0].children[14].innerHTML) //event id
                //console.log(showtimes.children[0].children[27].innerHTML) //theatre
                const tempArray = []
                for (let i = 0; i < showtimes.children.length; i++) {
                    const showId = showtimes.children[i].children[0].innerHTML
                    const eventStartTime = showtimes.children[i].children[2].innerHTML
                    const eventLocation = showtimes.children[i].children[27].innerHTML
                    const eventName = showtimes.children[i].children[15].innerHTML
                    tempArray.push({
                        showId: showId,
                        startTime: eventStartTime,
                        location: eventLocation,
                        movieName: eventName
                    })
                }
                setFinnkinoShowtimes(tempArray)
            })
            .catch(err => {
                console.error(err)
            })
    }

    const addToGroupPage = async (showtime) => {
        console.log(showtime)
        let responseGroupId = null
        //check if user is logged in
        if (!sessionStorage.getItem("user_id")) {
            console.log("sessionStoragesta ei löytynyt kenttää 'user_id' (kirjaudu sisään jatkaaksesi)")
            alert("You must be logged in to use this feature")
            //setInfotext("You must be logged in to use this feature")
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
            const post_url = import.meta.env.VITE_API_BASE_URL + "/sharedshowtimes"
            const params = {
                theatre: showtime.location,
                movieName: showtime.movieName,
                startTime: showtime.startTime,
                groupId: responseGroupId,
                sharerId: sessionStorage.getItem("user_id")
            }

            const responseFromPost = await axios.post(post_url, params)
            console.log(responseFromPost)
            //console.log("responsefrompost start time:" + responseFromPost.data.dateandtime)
            //console.log("responsefrompost theater: " + responseFromPost.data.theatre)
            //console.log("responsefrompost movie name: " + responseFromPost.data.movie_name)
            //console.log("responsefrompost sharer id: " + responseFromPost.data.sharer_id)
            if (responseFromPost.status === 201) {
                const formattedStartTime = new Date(responseFromPost.data.dateandtime).toLocaleString("en-US")
                alert(`You have successfully added the following showtime to your group page:
                    ${responseFromPost.data.movie_name}
                    ${responseFromPost.data.theatre}
                    ${formattedStartTime}`)
            }
            else if (responseFromPost.status === 500) {
                console.log(responseFromPost.data.error)
                alert("An error occurred.")
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
            else if (err.response.data.error === 'duplicate key value violates unique constraint \"unique_showtime\"') {
                alert("Showtime has already been added to your group page!")
            }
            else {
                alert("An error occurred")
            }
        }
    }


    return (
        <>
            <section id="search" className={styles.container_movieSearch}></section>

            {/* FINNKINO SHOWTIMES -OSIO */}
            <section id="finnkino" className={styles.section}>
                <div id="finnkino-search">
                    <h3>Näytösaikojen haku</h3>

                    <form onSubmit={e => { e.preventDefault(); searchShowtimes(); }}>
                        <select value={selectedFinnkinoMovie} onChange={(e) => { setSelectedFinnkinoMovie(e.target.value); console.log(e.target.value) }}>
                            <option className={styles.search_criteria} value="">Choose movie</option>
                            {finnkinoMovies.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>

                        <select value={selectedTheatre} onChange={(e) => { setSelectedTheatre(e.target.value); console.log(e.target.value) }}>
                            <option className={styles.search_criteria} value="">Choose theatre</option>
                            {finnkinoTheatres.map(theatre => (
                                <option key={theatre.id} value={theatre.id}>{theatre.name}</option>
                            ))}
                        </select>

                        <select value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); console.log(e.target.value) }}>
                            <option className={styles.search_criteria} value="">Choose date</option>
                            {Array.from({ length: 14 }, (_, i) => {
                                const date = new Date();
                                const options = { month: "2-digit", day: "2-digit", year: "numeric" };
                                date.setDate(date.getDate() + i);
                                const dateString = date.toLocaleDateString(undefined, options);
                                return <option key={dateString} value={dateString}>{dateString}</option>;
                            })}
                        </select>

                        <button type="submit" id="finnkinoSearch_button">Search</button>
                    </form>

                    {/* Näytösajat */}
                    <section id="showtimes" aria-labelledby="showtimes-heading">
                        <h3 id="showtimes-heading">Showtimes</h3>
                        <ul id={styles.showtimes_ul}>
                            {finnkinoShowtimes ? finnkinoShowtimes.map(showtime => {
                                //console.log(finnkinoShowtimes)
                                const datetime = new Date(showtime.startTime)
                                return (
                                <li key={showtime.startTime + showtime.location + showtime.movieName}>
                                    {datetime.toLocaleString("en-US")} -- {showtime.location} -- {showtime.movieName}
                                    <button onClick={() => {addToGroupPage(showtime)}}>Add to group page</button>
                                </li>
                                )
                            }) : "No showtimes matching search criteria"}
                        </ul>
                        {/*<p>{infotext}</p>*/}
                    </section>
                </div>
            </section>
        </>
    );


}




