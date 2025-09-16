import './SignUp.css'


function SignUp() {

    
    return (
        
      
     <div className="wrapper">  
        <div class="signup_container">
        
        <form className="sign_up_form">
            <h1>Sign up</h1>
            <div>
                <label>Insert your email:</label>
                <input type="email" required></input>
            </div>
            
            <div>
                <label>Choose your username:</label>
                <input type="username" required></input>
            </div>

            <div>
                <label>Choose your password:</label>
                <input type="password" required></input>
            </div>

            <div>
                <label>Confirm your password:</label>
                <input type="password" required></input>
            </div>

            <button className="signup_button" type="submit">Sign up</button>
            <p>(linkki) Already an user? Click here to sign in</p>
        </form>
        
        </div>
    </div> 
    ); 
}

export default SignUp   