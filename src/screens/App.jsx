import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from '../assets/components/Navbar.jsx';
import Header from '../assets/components/Header.jsx';

import Search from '../assets/components/Search.jsx'
import SignIn from '../screens/SignIn.jsx'
import SignUp from '../screens/SignUp.jsx'




function App() {
    return (

        <div className='App'>
            <Navbar />
            <Routes>
                <Route path="/"
                    element={
                        <>
                            <Header />
                            <Search />
                        </>
                    }
                />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />

            </Routes>

        </div>


    ); // end of return
}

export default App