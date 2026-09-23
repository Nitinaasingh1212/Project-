import React, { createContext, useEffect, useState } from 'react'
import { getLocalStorage, setLocalStorage } from '../utils/localStorage'
import { isFirebaseConfigured } from '../firebase/config'
import { seedInitialDataIfEmpty, subscribeToEmployees } from '../firebase/firestoreService'

export const AuthContext = createContext()

const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null)
    const [isDbReady, setIsDbReady] = useState(false)

    useEffect(() => {
        // Ensure local storage baseline exists
        setLocalStorage()
        const { employees } = getLocalStorage()
        setUserData(employees)

        let unsubscribe = () => {}

        const initDatabase = async () => {
            if (isFirebaseConfigured) {
                try {
                    await seedInitialDataIfEmpty()
                    unsubscribe = subscribeToEmployees((firestoreEmployees) => {
                        if (firestoreEmployees && firestoreEmployees.length > 0) {
                            setUserData(firestoreEmployees)
                        }
                        setIsDbReady(true)
                    })
                } catch (error) {
                    console.error("Failed to initialize Firestore connection:", error)
                    setIsDbReady(true)
                }
            } else {
                setIsDbReady(true)
            }
        }

        initDatabase()

        return () => {
            unsubscribe()
        }
    }, [])

    return (
        <AuthContext.Provider value={[userData, setUserData, { isFirebaseConfigured, isDbReady }]}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider