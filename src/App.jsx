import React, { useContext, useEffect, useState } from 'react'
import Login from './components/Auth/Login'
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard'
import AdminDashboard from './components/Dashboard/AdminDashboard'
import { AuthContext } from './context/AuthProvider'
import { authenticateCredentials } from './firebase/firestoreService'

const App = () => {

  const [user, setUser] = useState(null)
  const [loggedInUserData, setLoggedInUserData] = useState(null)
  const [userData] = useContext(AuthContext)

  // Restore session from localStorage on mount
  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser')
    
    if (loggedInUser) {
      try {
        const parsed = JSON.parse(loggedInUser)
        setUser(parsed.role)
        setLoggedInUserData(parsed.data)
      } catch (e) {
        localStorage.removeItem('loggedInUser')
      }
    }
  }, [])

  // Keep loggedInUserData in sync with real-time updates from database
  useEffect(() => {
    if (user === 'employee' && loggedInUserData && userData) {
      const updatedEmployee = userData.find(
        (e) => e.email?.toLowerCase() === loggedInUserData.email?.toLowerCase() ||
               e.id === loggedInUserData.id
      )
      if (updatedEmployee && JSON.stringify(updatedEmployee) !== JSON.stringify(loggedInUserData)) {
        setLoggedInUserData(updatedEmployee)
      }
    }
  }, [userData, user, loggedInUserData])

  const handleLogin = async (email, password) => {
    const authResult = await authenticateCredentials(email, password, userData)

    if (authResult) {
      setUser(authResult.role)
      setLoggedInUserData(authResult.data || null)
      localStorage.setItem('loggedInUser', JSON.stringify(authResult))
    } else {
      alert("Invalid Credentials. Please check your email and password.")
    }
  }

  return (
    <>
      {!user ? <Login handleLogin={handleLogin} /> : null}
      {user === 'admin' ? (
        <AdminDashboard changeUser={setUser} />
      ) : user === 'employee' && loggedInUserData ? (
        <EmployeeDashboard changeUser={setUser} data={loggedInUserData} />
      ) : null}
    </>
  )
}

export default App