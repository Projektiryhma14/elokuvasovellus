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
        const eventId = selectedFinnkinoMovie
        const dt = selectedDate
        const numberOfDays = 1
        const base_url = "https://www.finnkino.fi/xml/Schedule/"
        const full_url = base_url + "?area=" + theatreId + "&dt=" + dt + "&eventID=" + eventId// + "&nrOfDays=" + numberOfDays
        axios.get(full_url)
            .then(response => {
                const xml = response.data
                const parser = new DOMParser()
                const xmlDoc = parser.parseFromString(xml, 'application/xml')
                const root = xmlDoc.children
                const showtimes = root[0].children[1]
                const tempArray = []
                for (let i = 0; i < showtimes.children.length; i++) {
                    tempArray.push(showtimes.children[i].children[2].innerHTML)
                }
                setFinnkinoShowtimes(tempArray)
            })
            .catch(err => {
                console.error(err)
            })
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
                        <ul>
                            {finnkinoShowtimes.map(showtime => {
                                const datetime = new Date(showtime);
                                return <li key={showtime}>{datetime.toLocaleString("en-US")}</li>;
                            })}
                        </ul>
                    </section>
                </div>
            </section>
        </>
    );


}




