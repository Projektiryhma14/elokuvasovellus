import './SignIn.css'


function SignIn() {

    
    return (
        
        <div class="wrapper">
            <div class="signin_container">

                <form className="sign_in_form">
                    <h1>Sign in</h1>

                    <div>
                        <label>Enter your username:</label>
                        <input type="username" required></input>
                    </div>

                    <div>
                        <label>Enter your password:</label>
                        <input type="password" required></input>
                    </div>

                    <button className="signin_button" type="submit">Sign in</button>
                    <p>(linkki) Don't have an account? Click here to sign up</p>
                </form>

            </div>
        </div>

    ); 
}

export default SignIn   