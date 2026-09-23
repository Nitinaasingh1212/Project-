import React, { useContext } from 'react'
import { AuthContext } from '../../context/AuthProvider'

const AllTask = () => {
    const [userData] = useContext(AuthContext)

    return (
        <div className='bg-[#1c1c1c] p-5 rounded mt-5'>
            <div className='bg-emerald-800 mb-3 py-2 px-4 flex justify-between rounded text-white text-sm font-semibold'>
                <h2 className='w-1/5'>Employee Name</h2>
                <h3 className='w-1/5'>New Task</h3>
                <h5 className='w-1/5'>Active Task</h5>
                <h5 className='w-1/5'>Completed</h5>
                <h5 className='w-1/5'>Failed</h5>
            </div>
            <div className='overflow-auto max-h-60'>
                {userData && userData.length > 0 ? (
                    userData.map((elem, idx) => (
                        <div 
                            key={idx} 
                            className='border border-emerald-500/40 hover:border-emerald-500 transition-colors mb-2 py-2 px-4 flex justify-between rounded items-center bg-black/20'
                        >
                            <h2 className='text-base font-medium w-1/5 text-white capitalize'>{elem.firstName}</h2>
                            <h3 className='text-base font-semibold w-1/5 text-blue-400'>{elem.taskCounts?.newTask ?? 0}</h3>
                            <h5 className='text-base font-semibold w-1/5 text-yellow-400'>{elem.taskCounts?.active ?? 0}</h5>
                            <h5 className='text-base font-semibold w-1/5 text-emerald-400'>{elem.taskCounts?.completed ?? 0}</h5>
                            <h5 className='text-base font-semibold w-1/5 text-rose-500'>{elem.taskCounts?.failed ?? 0}</h5>
                        </div>
                    ))
                ) : (
                    <div className='text-center py-6 text-gray-400 text-sm'>
                        Loading employee data from database...
                    </div>
                )}
            </div>
        </div>
    )
}

export default AllTask