import './SignUp.css'
import { useState } from 'react'
import axios from 'axios'

function SignUp() {

    //const userFromStorage = sessionStorage.getItem('user')
    //const [user, setUser] = useState(userFromStorage ? JSON.parse(userFromStorage) : {email: '', username: '', password: ''})
    const [user, setUser] = useState({ email: '', username: '', password: '' })
    const [statusMessage, setStatusMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        const url = "http://localhost:3001/signup" //mahdollisesti siirtää urli env tiedostoon?
        if (!user || !user.email || !user.password || !user.username) {
            console.log("user muuttujassa ei kaikkia tarvittavia elementtejä")
            return
        }
        //const headers = {headers: {'Content-Type': 'application/json'}}
        //axios.post(url, {user})
        axios.post(url, user)
            .then(response => {
                console.log(`Rekisteröityminen onnistui. Luodun käyttäjän id: ${response.id}, ja email: ${response.email}`)
                setStatusMessage('Rekisteröityminen onnistui')
                //tähän vielä formin input kenttien tyhjennys (jos rekisteröityminen onnistuu)
                //setUser({...user, email: ''})
                //setUser({...user, username: ''})
                //setUser({...user, password: ''})
                e.target.reset()

            })
            .catch(err => {
                console.error(err)
            })
    }

    return (


        <div className="wrapper">
            <div className="signup_container">

                <form className="sign_up_form" onSubmit={e => { handleSubmit(e) }}>
                    <h1>Sign up</h1>
                    <div>
                        <label>Insert your email:</label>
                        <input type="email" required onChange={e => setUser({ ...user, email: e.target.value })}></input>
                    </div>

                    <div>
                        <label>Choose your username:</label>
                        <input type="username" required onChange={e => setUser({ ...user, username: e.target.value })}></input>
                    </div>

                    <div>
                        <label>Choose your password:</label>
                        <input type="password" required onChange={e => setUser({ ...user, password: e.target.value })}></input>
                    </div>

                    {/* <div> EI PAKOLLINEN OMINAISUUS, MIETITÄÄN TOTEUTTAMISTA
                <label>Confirm your password:</label>
                <input type="password" required></input>
            </div> */}

                    <button className="signup_button" type="submit">Sign up</button>
                    <p>(linkki) Already an user? Click here to sign in</p>
                    <p>{statusMessage}</p>
                </form>

            </div>
        </div>
    );
}

export default SignUp   