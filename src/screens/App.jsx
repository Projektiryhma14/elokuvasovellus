import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';

//import ProtectedRoute from '../assets/components/ProtectedRoute.jsx';

import Navbar from '../assets/components/Navbar.jsx';
import Header from '../assets/components/Header.jsx';

//import MyProfile from "../screens/MyProfile.jsx"
//import Group from "../screens/Group.jsx"

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

                {/*Julkiset linkit*/}
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />

                {/*Suojatut linkit*/}

                {/*    
                <Route path="*" element={<NotFound />} />
                */}
            </Routes>

        </div>


    ); // end of return
}

export default App