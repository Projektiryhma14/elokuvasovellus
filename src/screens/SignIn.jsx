import './SignIn.css'
import { useState } from 'react'
import axios from 'axios'


function SignIn() {

    const [user, setUser] = useState({username: '', password: '' })
    const [statusMessage, setStatusMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        const url = "http://localhost:3001/signin" //mahdollisesti siirtää urli env tiedostoon?
        if (!user || !user.password || !user.username) {
            console.log("user muuttujassa ei kaikkia tarvittavia elementtejä")
            return
        }
        //const headers = {headers: {'Content-Type': 'application/json'}}
        //axios.post(url, {user})
        axios.post(url, user)
            .then(response => {
                console.log(`Kirjautuminen onnistui. Käyttäjän id: ${response.data.id}, ja email: ${response.data.email}`)
                setStatusMessage('Kirjautuminen onnistui')
                //tähän vielä formin input kenttien tyhjennys (jos rekisteröityminen onnistuu)
                //setUser({...user, email: ''})
                //setUser({...user, username: ''})
                //setUser({...user, password: ''})
                console.log(response.data)
                e.target.reset()
                //automaattinen siirtyminen etusivulle, kun kirjautuminen onnistuu?

            })
            .catch(err => {
                console.error(err)
            })
    }

    return (
        
        <div class="wrapper">
            <div class="signin_container">

                <form className="sign_in_form" onSubmit={e => { handleSubmit(e) }}>
                    <h1>Sign in</h1>

                    <div>
                        <label>Enter your username:</label>
                        <input type="username" required onChange={e => setUser({ ...user, username: e.target.value })}></input>
                    </div>

                    <div>
                        <label>Enter your password:</label>
                        <input type="password" required onChange={e => setUser({ ...user, password: e.target.value })}></input>
                    </div>

                    <button className="signin_button" type="submit">Sign in</button>
                    <p>(linkki) Don't have an account? Click here to sign up</p>
                </form>

            </div>
        </div>

    ); 
}

export default SignIn   