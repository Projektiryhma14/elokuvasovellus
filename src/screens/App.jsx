import './App.css'
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../routes/ProtectedRoute.jsx';
import InfoBanner from '../assets/components/InfoBanner.jsx'


import Navbar from '../assets/components/Navbar.jsx';
import Header from '../assets/components/Header.jsx';

import TmdbSearch from '../assets/components/TmdbSearch.jsx'
import FinnkinoSearch from '../assets/components/FinnkinoSearch.jsx';
import MyProfile from "../screens/MyProfile.jsx"
import Group from "../screens/Group.jsx"

import SignIn from '../screens/SignIn.jsx'
import SignUp from '../screens/SignUp.jsx'
import ReviewForm from './ReviewForm.jsx';

import TestAuthStatus from './TestAuthStatus.jsx';


function App() {

    return (


        <div className='App'>



            <InfoBanner />
            <Navbar />

            <Routes>
                <Route path="/"
                    element={
                        <>
                            <Header />
                            <TmdbSearch />
                            <FinnkinoSearch />
                        </>
                    }
                />

                {/*Julkiset linkit*/}
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />


                {/* Suojatut linkit */}
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute returnTo="/profile">
                            <MyProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/group"
                    element={
                        <ProtectedRoute returnTo="/group">
                            <Group />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/reviewform"
                    element={
                        <ProtectedRoute returnTo="/reviewform">
                            <ReviewForm />
                        </ProtectedRoute>
                    }
                />

                {/*    
                <Route path="*" element={<NotFound />} />
                */}
            </Routes>

        </div>


    ); // end of return
}

export default App