import { useState } from 'react'
import './App.css'
import axios from 'axios'


function App() {

    const [query, setQuery] = useState("")
    const [output, setOutput] = useState("")

    const [ genre, setGenre ] = useState("")
    const [ year, setYear ] = useState('')

    

    const searchMovie= async() => {

        const headers = {headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZGI0OGY0ODEzMjZlY2JjODkyNDQxZmY3MTAzM2Q4NCIsIm5iZiI6MTc1NzYwNzQ5NC40MjMsInN1YiI6IjY4YzJmNjQ2MGU5MTJhMzhlNjA2YjU4ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.s7CFT7zRwYGGhBK1QFDCbRr2JrubJSJaGRZvJJxBKYc',
            'accept': 'application/json'
        }}

        console.log(genre)
        axios.get(`https://api.themoviedb.org/3/discover/movie?include_adult=false&language=en-US&with_genres=${genre}&primary_release_year=${year}&page=1`, headers)
        .then(response => {
            console.log(response)
            //setOutput(response.data.results[0].genre)
        })
        .catch(error => {
            alert(error)
        })

    }




    

    return (
        // <div id="container">
        //     <h3>TMDB Movie search</h3>
        //     <form action="">
        //         <label>Select title: </label>
        //         <input onChange={e => setQuery(e.target.value)} type="text" />
        //         <button onClick={e => {e.preventDefault()
        //         searchMovie()}}>Search</button>
        //     </form>            
        //     <ul>
        //         <li>{output}</li>
        //     </ul>              
        // </div>

        <div id='container'>
            <form action="#">
                <label>Choose genre:</label>
                <select value={genre} onChange={(e) => {setGenre(e.target.value); console.log(e.target.value)}}>
                    <option value="Action">Action</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Animation">Animation</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Crime">Crime</option>
                    <option value="Documentary">Documentary</option>
                    <option value="Drama">Drama</option>
                    <option value="Family">Family</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="History">History</option>
                    <option value="Horror">Horror</option>
                    <option value="Music">Music</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Romance">Romance</option>
                    <option value="Science Fiction">Science Fiction</option>
                    <option value="Tv Movie">TV Movie</option>
                    <option value="Thriller">Thriller</option>
                    <option value="War">War</option>
                    <option value="Western">Western</option>
                </select>


                <select value={year} onChange={(e) => {setYear(e.target.value); console.log(e.target.value)}}>
                    <option value="">Kaikki vuodet</option>
                    {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => {
                        const y = new Date().getFullYear() - i;
                        return (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        );
                    })}
                </select>

                <br></br>
                <button onClick={e => {e.preventDefault(); searchMovie()}}>Search</button>
            </form>
        </div>

        
    );
}

export default App