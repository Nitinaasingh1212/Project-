import React, { useContext } from 'react'
import { AuthContext } from '../../context/AuthProvider'

const Header = (props) => {
  const [, , dbInfo] = useContext(AuthContext) || []

  const logOutUser = () => {
    localStorage.removeItem('loggedInUser')
    props.changeUser('')
  }

  const displayName = props.data?.firstName || 'Admin'

  return (
    <div className='flex items-end justify-between'>
        <div>
          <div className='flex items-center gap-2 mb-1'>
            {dbInfo?.isFirebaseConfigured ? (
              <span className='inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full'>
                <span className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse'></span>
                Firestore Live
              </span>
            ) : (
              <span className='inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-full'>
                <span className='w-2 h-2 rounded-full bg-amber-400'></span>
                Local Mode (Configure .env for Firestore)
              </span>
            )}
          </div>
          <h1 className='text-2xl font-medium'>Hello <br /> <span className='text-3xl font-semibold capitalize'>{displayName} 👋</span></h1>
        </div>
        <button 
          onClick={logOutUser} 
          className='bg-red-600 hover:bg-red-700 transition-colors text-base font-medium text-white px-5 py-2 rounded-sm'
        >
          Log Out
        </button>
    </div>
  )
}

export default Header