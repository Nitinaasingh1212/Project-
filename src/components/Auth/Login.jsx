import React, { useState } from 'react'

const Login = ({ handleLogin }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const submitHandler = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await handleLogin(email, password)
        } finally {
            setIsSubmitting(false)
        }
    }

    const fillCredentials = (demoEmail, demoPass) => {
        setEmail(demoEmail)
        setPassword(demoPass)
    }

    return (
        <div className='flex min-h-screen w-screen items-center justify-center p-4 bg-[#111111]'>
            <div className='border border-emerald-500/40 bg-[#1c1c1c] rounded-2xl p-8 sm:p-14 w-full max-w-md shadow-2xl'>
                <div className='text-center mb-8'>
                    <h1 className='text-3xl font-bold text-white'>EMS Portal</h1>
                    <p className='text-sm text-gray-400 mt-1'>Employee Management System</p>
                </div>

                <form onSubmit={submitHandler} className='flex flex-col'>
                    <label className='text-xs font-semibold text-gray-400 mb-1.5'>Email Address</label>
                    <input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                        className='outline-none bg-black/40 border border-emerald-500/50 focus:border-emerald-400 text-white font-medium text-base py-2.5 px-4 rounded-xl placeholder:text-gray-500 transition-colors mb-4' 
                        type="email" 
                        placeholder='Enter your email' 
                    />

                    <label className='text-xs font-semibold text-gray-400 mb-1.5'>Password</label>
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        className='outline-none bg-black/40 border border-emerald-500/50 focus:border-emerald-400 text-white font-medium text-base py-2.5 px-4 rounded-xl placeholder:text-gray-500 transition-colors mb-6' 
                        type="password" 
                        placeholder='Enter password' 
                    />

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className='text-white border-none outline-none hover:bg-emerald-500 font-semibold bg-emerald-600 disabled:opacity-50 text-base py-3 px-6 w-full rounded-xl transition-colors shadow-lg cursor-pointer'
                    >
                        {isSubmitting ? 'Verifying...' : 'Log In'}
                    </button>
                </form>

                {/* Quick Demo Credentials helper */}
                <div className='mt-8 pt-6 border-t border-gray-800 text-xs text-gray-400'>
                    <p className='text-center font-medium text-gray-400 mb-2.5'>Quick Demo Accounts:</p>
                    <div className='flex gap-2 justify-center'>
                        <button 
                            type="button"
                            onClick={() => fillCredentials('admin@me.com', '123')}
                            className='px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900 transition-colors'
                        >
                            Fill Admin (admin@me.com)
                        </button>
                        <button 
                            type="button"
                            onClick={() => fillCredentials('e@e.com', '123')}
                            className='px-3 py-1.5 rounded-lg bg-blue-950/70 border border-blue-800/80 text-blue-300 hover:bg-blue-900 transition-colors'
                        >
                            Fill Employee (e@e.com)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login