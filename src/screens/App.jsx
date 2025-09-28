import './App.css'
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../routes/ProtectedRoute.jsx';
import InfoBanner from '../assets/components/InfoBanner.jsx'


import Navbar from '../assets/components/Navbar.jsx';
import Header from '../assets/components/Header.jsx';


import MyProfile from "../screens/MyProfile.jsx"
import ProfileSettings from "../screens/ProfileSettings.jsx"
import Group from "../screens/Group.jsx"

import Search from '../assets/components/Search.jsx'
import SignIn from '../screens/SignIn.jsx'
import SignUp from '../screens/SignUp.jsx'




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
                            <Search />
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

                {/*    
                <Route path="*" element={<NotFound />} />
                */}
            </Routes>

        </div>


    ); // end of return
}

export default App