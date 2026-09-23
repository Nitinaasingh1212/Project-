import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../../context/AuthProvider'
import { addEmployeeProfile } from '../../firebase/firestoreService'

const CreateEmployeeModal = ({ onClose }) => {
    const [, setUserData] = useContext(AuthContext)
    const [firstName, setFirstName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [statusMessage, setStatusMessage] = useState(null)

    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setStatusMessage(null)

        try {
            const res = await addEmployeeProfile({
                firstName,
                email,
                password
            })

            if (res?.localData && setUserData) {
                setUserData(res.localData)
            }

            setStatusMessage({
                type: 'success',
                text: `✅ Profile created successfully for ${firstName}!`
            })

            setTimeout(() => {
                onClose()
            }, 1200)
        } catch (error) {
            console.error("Error creating employee profile:", error)
            setStatusMessage({
                type: 'error',
                text: error.message || 'Failed to create profile.'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div 
            className='fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4'
            onClick={onClose}
        >
            <div 
                className='bg-[#1c1c1c] border border-gray-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className='p-6 border-b border-gray-800 flex items-center justify-between bg-[#222222]'>
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-full bg-emerald-600/30 border border-emerald-500/60 flex items-center justify-center text-lg'>
                            👤
                        </div>
                        <div>
                            <h2 className='text-xl font-bold text-white'>Add New Employee</h2>
                            <p className='text-xs text-gray-400'>Create a new login profile for team members</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className='w-8 h-8 rounded-full bg-gray-800 hover:bg-rose-600 hover:text-white transition-colors text-gray-400 flex items-center justify-center text-sm'
                    >
                        ✕
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className='p-6 space-y-4'>
                    {statusMessage && (
                        <div className={`p-3 rounded-lg text-xs font-semibold ${
                            statusMessage.type === 'success'
                                ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
                                : 'bg-rose-950/80 border border-rose-500 text-rose-300'
                        }`}>
                            {statusMessage.text}
                        </div>
                    )}

                    <div>
                        <label className='block text-xs font-medium text-gray-300 mb-1.5'>
                            First Name <span className='text-rose-400'>*</span>
                        </label>
                        <input
                            required
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="e.g. Rohit"
                            className='w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 focus:border-emerald-500 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-colors'
                        />
                    </div>

                    <div>
                        <label className='block text-xs font-medium text-gray-300 mb-1.5'>
                            Email Address <span className='text-rose-400'>*</span>
                        </label>
                        <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. rohit@example.com"
                            className='w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 focus:border-emerald-500 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-colors'
                        />
                    </div>

                    <div>
                        <label className='block text-xs font-medium text-gray-300 mb-1.5'>
                            Password <span className='text-rose-400'>*</span>
                        </label>
                        <input
                            required
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="e.g. 123"
                            className='w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 focus:border-emerald-500 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-colors'
                        />
                    </div>

                    {/* Actions */}
                    <div className='pt-3 flex gap-3'>
                        <button
                            type="button"
                            onClick={onClose}
                            className='flex-1 py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors'
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className='flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-lg shadow-emerald-900/40'
                        >
                            {loading ? 'Creating...' : 'Create Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateEmployeeModal
