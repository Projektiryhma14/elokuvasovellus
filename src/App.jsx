import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'


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


    // Suoritetaan kun käyttäjä painaa "Search" (form on submit)
    const searchMovie = async () => {
        try {
            const res = await axios.get("https://api.themoviedb.org/3/discover/movie", {
                params: {
                    api_key: import.meta.env.VITE_API_KEY,        // v3 API key
                    include_adult: false,
                    language: "fi-FI",      // UI-teksti suomeksi, jos on saatavilla
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

    const showMovieDetails = async () => {
        try {
            //console.log(movieId)
            const details = await axios.get(
                "https://api.themoviedb.org/3/movie", {
                params: {
                    api_key: import.meta.env.VITE_API_KEY,
                    movie_id: movieId || undefined
                }
            }
            )
            setMovieDetails(details.data.results || [])
            setPlot(movieDetails.overview)
        }
        catch (error) {
            console.error("Elokuvan tietojen haku epäonnistui: ", error)
        }
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
    }, []);                 // Ei uudelleen hae state-muutoksissa

    return (




        <div id='container'>

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
                            <li key={m.id} onClick={e => { console.log(m.id/*e.target*/)/*showMovieDetails(m.id)*/ }}>
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
            <div id="movieResult-box">
                <h3>Selected movie</h3>
            </div>
            <div id="overview-box">
                <h3>Overview</h3>
                <p>{plot}</p>
            </div>


        </div>


    );
}

export default App