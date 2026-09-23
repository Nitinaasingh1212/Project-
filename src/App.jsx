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
        (e) => (loggedInUserData.email && e.email?.toLowerCase() === loggedInUserData.email?.toLowerCase()) ||
               (loggedInUserData.id && String(e.id) === String(loggedInUserData.id)) ||
               (loggedInUserData.docId && e.docId === loggedInUserData.docId)
      )
      if (updatedEmployee && JSON.stringify(updatedEmployee) !== JSON.stringify(loggedInUserData)) {
        setLoggedInUserData(updatedEmployee)
        localStorage.setItem('loggedInUser', JSON.stringify({ role: 'employee', data: updatedEmployee }))
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

  const handleLogout = () => {
    setUser(null)
    setLoggedInUserData(null)
    localStorage.removeItem('loggedInUser')
  }

  return (
    <>
      {!user ? <Login handleLogin={handleLogin} /> : null}
      {user === 'admin' ? (
        <AdminDashboard changeUser={handleLogout} />
      ) : user === 'employee' && loggedInUserData ? (
        <EmployeeDashboard changeUser={handleLogout} data={loggedInUserData} />
      ) : null}
    </>
  )
}

export default App