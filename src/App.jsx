import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'
import placeholder from './pics/movie_poster_not_available.png'
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";




function App() {

    const [query, setQuery] = useState("")                  // ei käytössä
    const [output, setOutput] = useState("")                // Näytetään <pre>-tagissä. APIN raaka-data (debug)

    // Filtterit (dropdown)
    const [genre, setGenre] = useState("")                  // TMDb genre-ID (esim. "28" = Action). Tyhjä = ei genrefiltteriä
    const [year, setYear] = useState('')                    // Vuosi filtteri (tyhjä = ei vuodensuodatusta)
    const [language, setLanguage] = useState('')            // Alkuperäiskieli filtteri (ISO-639-1, esim. "en","fi"; tyhjä = ei kielisuodatusta)

    // -- Data listaukseen --
    const [movies, setMovies] = useState([])                // tänne voisi tallentaa hakutulokset (nyt ei käytössä listauksessa)
    const [popularMovies, setPopularMovies] = useState([])  // käytetään "Popular now" -listaan
    const [plot, setPlot] = useState("")                    // valitun elokuvan juoni (oikean laatikon sisältö tulevaisuudessa)

    // -- Sivutus “näytä 10 kerrallaan” --
    const [page, setPage] = useState(1);                    // nykyinen sivu (1-pohjainen)
    const itemsPerPage = 10;                                // montako itemiä näytetään per sivu

    // Lasketaan mitä indeksejä näytetään nykyisellä sivulla
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Leikataan näkyviin tuleva pätkä popularMovies-taulukosta
    const currentMovies = popularMovies.slice(startIndex, endIndex);

    const [movieDetails, setMovieDetails] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState("")

    // finnkino hakuun tarvittavat tilamuuttujat
    const [finnkinoMovies, setFinnkinoMovies] = useState([])
    const [selectedFinnkinoMovie, setSelectedFinnkinoMovie] = useState('')
    const [finnkinoTheatres, setFinnkinoTheatres] = useState([])
    const [selectedTheatre, setSelectedTheatre] = useState('')
    const [selectedDate, setSelectedDate] = useState('')
    const [finnkinoShowtimes, setFinnkinoShowtimes] = useState([])

    // MOVIE SEARCH OSIO !!!!!
    // Suoritetaan kun käyttäjä painaa "Search" (form on submit)
    const searchMovie = async () => {
        try {
            const res = await axios.get("https://api.themoviedb.org/3/discover/movie", {
                params: {
                    api_key: import.meta.env.VITE_API_KEY,        // v3 API key
                    include_adult: false,
                    language: "en-US",      // UI-teksti suomeksi, jos on saatavilla
                    with_original_language: language || undefined,
                    with_genres: genre || undefined,
                    primary_release_year: year || undefined,
                    page: 1,
                },
            });
            setMovies(res.data.results || []);                      // Tallennetaan dropdown valinnat listaan.
            setPopularMovies(res.data.results || []);
            console.log(res.data.results);                          // debug (näkyy konsolissa)
            setOutput(JSON.stringify(res.data.results, null, 2));   // raakadata <pre>-näyttöön (debugia varten)
        } catch (err) {
            console.error(err);
        }
    }

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
            for (let i=0; i<theatres.length; i++) {
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
            for (let i=0; i<events.length; i++) {
                // tarkistetaan, että event on elokuva (eikä esim live-tapahtuma)
                if(events[i].children[12].innerHTML === "Movie") {
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
        const eventId = selectedMovie
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
            for (let i=0; i<showtimes.children.length; i++) {
                tempArray.push(showtimes.children[i].children[2].innerHTML)
            }
            setFinnkinoShowtimes(tempArray)
        })
        .catch(err => {
            console.error(err)
        })
    }

    // Käytetään useEfectiä, eli haetaan vain kerran, kun komponentti ladataan
    // Ladataan popular movies listaan
    useEffect(() => {
        const noudaPopular = async () => {
            try {
                const { data } = await axios.get(
                    "https://api.themoviedb.org/3/trending/movie/day",
                    {

                        params: {
                            api_key: import.meta.env.VITE_API_KEY,
                            language: "en-US",
                        },
                    }
                );
                setPopularMovies(data.results || []);           // tallennetaan popular-lista stateen, palauttaa max 20 itemiä
            } catch (err) {
                console.error("Popular-elokuvien haku epäonnistui:", err);
            }
        };

        noudaPopular();     // kutsutaan heti
        getFinnkinoTheatres()
        getFinnkinoMovies()
    }, []);                 // Ei uudelleen hae state-muutoksissa


    //Funktio jolla muutetaan TMDB- vote_average tähdiksi
    function NaytaTahdet({ vote_average, maxStars = 5 }) {
        const rating = (vote_average / 10) * maxStars;
        const filledStars = Math.floor(rating);
        const hasHalfStar = rating - filledStars >= 0.5;

        return (
            <div className='vote_stars'>
                {[...Array(maxStars)].map((_, i) => {
                    if (i < filledStars) {
                        return <FaStar key={i} color="gold" />
                    } else if (i === filledStars && hasHalfStar) {
                        return <FaStarHalfAlt key={i} color="gold" />
                    } else {
                        return <FaRegStar key={i} color="gold" />
                    }
                })}
            </div>
        )
    }

    // FINKINO OSIO !!!!
    {/* 
    const [areas, setAreas] = useState([])

    const getFinnkinoTheatres = (xml) => {
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xml, 'application/xml')
        const root = xmlDoc.children
        const theatres = root[0].children
        const tempAreas = []
        for (let i = 0; i < theatres.length; i++) {
            //console.log(theatres[i].children[0].innerHTML)
            // console.log(theatres[i].children[1].innerHTML)
            tempAreas.push(
                {
                    "id": theatres[i].children[0].innerHTML,
                    "name": theatres[i].children[1].innerHTML
                }
            )
        }
        setAreas(tempAreas)

    }

    
    
    useEffect(() => {
        fetch('https://www.finnkino.fi/xml/TheatreAreas/')
            .then(response => response.text())
            .then(xml => {
                //console.log(xml)
                getFinnkinoTheatres(xml)
            })
            .catch(error => {
                console.log(error)
            })
    }, [])
*/}



    return (

        <div className='container_movieSearch'>

            <div id="search-box">
                {/* form: Enter painaminenkin lähettää haun; e.preventDefault() ettei selain lataa sivua */}
                <form onSubmit={e => { e.preventDefault(); searchMovie(); }}>

                    <div className="select-div">
                        <select value={genre} onChange={(e) => { setGenre(e.target.value); console.log(e.target.value) }}>
                            <option className="search_criteria" value="">Choose genre</option>
                            <option value="28">Action</option>
                            <option value="12">Adventure</option>
                            <option value="16">Animation</option>
                            <option value="35">Comedy</option>
                            <option value="80">Crime</option>
                            <option value="99">Documentary</option>
                            <option value="18">Drama</option>
                            <option value="10751">Family</option>
                            <option value="14">Fantasy</option>
                            <option value="36">History</option>
                            <option value="27">Horror</option>
                            <option value="10402">Music</option>
                            <option value="9648">Mystery</option>
                            <option value="10749">Romance</option>
                            <option value="878">Science Fiction</option>
                            <option value="10770">TV Movie</option>
                            <option value="53">Thriller</option>
                            <option value="10752">War</option>
                            <option value="37">Western</option>
                        </select>
                    </div>

                    <div className="select-div">
                        <select value={year} onChange={(e) => { setYear(e.target.value); console.log(e.target.value) }}>

                            <option className="search_criteria" value="">Choose year</option>
                            {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => {
                                const y = new Date().getFullYear() - i;
                                return (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="select-div">
                        <select value={language} onChange={(e) => { setLanguage(e.target.value); console.log(e.target.value) }}>
                            <option className='search_criteria' value="">Choose language</option>
                            <option value="en">English</option>
                            <option value="fi">Finnish</option>
                            <option value="sv">Swedish</option>
                            <option value="ja">Japanese</option>
                            <option value="fr">French</option>
                            <option value="es">Spanish</option>
                            <option value="de">German</option>
                        </select>
                    </div>
                    <br></br>
                    <button type='submit' id="movieSearch_button">Search</button>
                </form>

                {/*Raaka-datan esittäminen, kauniisti <pre> -tagillä*/}
                {/*<p>Output state: {output ? "Dataa tulee" : "Tyhjä"}</p>*/}
                {/*<pre>{output}</pre>*/}
            </div >


            <div id="popular-box">
                <h3>{movies.length > 0 ? "Search Results" : "Popular Movies Today"}</h3>
                <ul>
                    {currentMovies.map((m) => {
                        const year = m.release_date?.slice(0, 4) || "—";
                        return (
                            <li key={m.id} onClick={e => { setSelectedMovie(m) }}>
                                {m.title} ({year})
                            </li>
                        );
                    })}
                </ul>

                <div className='next_prev'>
                    <button id="prev_button"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                    >Edelliset</button>

                    <button id="next_button"
                        onClick={() => setPage(page + 1)}
                        disabled={endIndex >= popularMovies.length}
                    >Seuraavat</button>
                </div>


            </div>
            <div className="movieResult-box">
                <h3>Selected movie</h3>
                <div>
                    {selectedMovie.title}
                </div>

                <div>

                    <img
                        className="poster"
                        src={
                            selectedMovie.poster_path
                                ? `https://image.tmdb.org/t/p/w342${selectedMovie.poster_path}`
                                : placeholder
                        }
                        alt={selectedMovie.title}
                    />
                </div>
                <div className='vote_stars'>
                    <NaytaTahdet vote_average={selectedMovie.vote_average} />
                </div>
            </div>

            <div id="overview-box">
                <h3>Overview</h3>
                {selectedMovie.overview}
            </div>

            <div id="finnkino-search">
                <h3>Näytösaikojen haku</h3>
                <form onSubmit={e => { e.preventDefault(); searchShowtimes(); }}>
                    <select value={selectedMovie} onChange={(e) => {setSelectedMovie(e.target.value); console.log(e.target.value)}}>
                        <option className="search_criteria" value="">Choose movie</option>
                        {
                            finnkinoMovies.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))
                        }
                    </select>
                    <select value={selectedTheatre} onChange={(e) => { setSelectedTheatre(e.target.value); console.log(e.target.value) }}>
                        <option className="search_criteria" value="">Choose theatre</option>
                        {
                            finnkinoTheatres.map(theatre => (
                                <option key={theatre.id} value={theatre.id}>{theatre.name}</option>
                            ))
                        }
                    </select>
                    <select value={selectedDate} onChange={(e) => {setSelectedDate(e.target.value); console.log(e.target.value)}}>
                        <option className="search_criteria" value="">Choose date</option>
                        {
                            Array.from({length: 14}, (_, i) => {
                                const date = new Date()
                                const options = {month: "2-digit", day: "2-digit", year: "numeric"}
                                date.setDate(date.getDate() + i)
                                const dateString = date.toLocaleDateString(undefined, options)
                                return (
                                    <option key={dateString} value={dateString}>{dateString}</option>
                                )
                            })
                        }
                    </select>
                    <button type="submit" id="finnkinoSearch_button">Search</button>
                </form>
            </div>
            <div id="showtimes">
                <h3>Showtimes</h3>
                <ul>
                    {
                        finnkinoShowtimes.map(showtime => {
                            const datetime = new Date(showtime)
                            return (
                                <li key={showtime}>{datetime.toLocaleString("en-US")}</li>
                            )
                        })
                    }
                </ul>
            </div>


            {/*
            <div className='container_finkino'>
                <div>
                    <h1>Finnkino</h1>
                </div>
                <div>
                    <select>
                        {
                            areas.map(area => (
                                <option key={area.id}>{area.name}</option>
                            ))
                        }
                    </select>
                </div>


            </div>
            */}
        </div>








    ); // end of return
}

export default App