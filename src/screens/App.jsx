import './App.css'
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../routes/ProtectedRoute.jsx';
import InfoBanner from '../assets/components/InfoBanner.jsx'


import Navbar from '../assets/components/Navbar.jsx';
import Header from '../assets/components/Header.jsx';

import TmdbSearch from '../assets/components/TmdbSearch.jsx'
import FinnkinoSearch from '../assets/components/FinnkinoSearch.jsx';
import SharedFavourites from '../assets/components/SharedFavourites.jsx';
import MyProfile from "../screens/MyProfile.jsx"
import ProfileSettings from "../screens/ProfileSettings.jsx"
import Group from "../screens/Group.jsx"
import CreateGroup from "../screens/CreateGroup.jsx"


import SignIn from '../screens/SignIn.jsx'
import SignUp from '../screens/SignUp.jsx'

import Reviews from './Reviews.jsx'

import ReviewForm from './ReviewForm.jsx';

import GroupProfile from './GroupProfile.jsx';


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
                            <SharedFavourites />
                        </>
                    }
                />

                {/*Julkiset linkit*/}
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/profile/:username" element={<MyProfile />} />

                {/* Suojatut linkit */}

                <Route
                    path="/profileSettings"
                    element={
                        <ProtectedRoute returnTo="/profileSettings">
                            <ProfileSettings />
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

                <Route
                    path="/group/create"
                    element={
                        <ProtectedRoute returnTo="/group/create">
                            <CreateGroup />
                        </ProtectedRoute>
                    }
                />

                                <Route
                    path="/group/:id"
                    element={
                        <ProtectedRoute returnTo="/group/:id">
                            <GroupProfile />
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