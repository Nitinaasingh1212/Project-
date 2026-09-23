import React, { useContext, useState } from 'react'
import { AuthContext } from '../../context/AuthProvider'
import EmployeeWorkModal from './EmployeeWorkModal'

const AllTask = () => {
    const [userData] = useContext(AuthContext)
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)

    // Keep selected employee data fresh if real-time Firestore updates arrive
    const selectedEmployee = userData?.find(
        (e) => (e.docId && e.docId === selectedEmployeeId) ||
               (e.id && String(e.id) === String(selectedEmployeeId)) ||
               e.firstName === selectedEmployeeId
    ) || null

    return (
        <div className='bg-[#1c1c1c] p-5 rounded mt-5'>
            <div className='flex items-center justify-between mb-3'>
                <h2 className='text-lg font-semibold text-white'>Employee Task Overview</h2>
                <span className='text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full'>
                    💡 Click on any employee to view their full work
                </span>
            </div>

            <div className='bg-emerald-800 mb-3 py-2.5 px-4 flex justify-between items-center rounded text-white text-sm font-semibold'>
                <h2 className='w-1/6'>Employee Name</h2>
                <h3 className='w-1/6 text-center'>New Task</h3>
                <h5 className='w-1/6 text-center'>Active Task</h5>
                <h5 className='w-1/6 text-center'>Completed</h5>
                <h5 className='w-1/6 text-center'>Failed</h5>
                <h5 className='w-1/6 text-right'>Action</h5>
            </div>

            <div className='overflow-auto max-h-72 space-y-2'>
                {userData && userData.length > 0 ? (
                    userData.map((elem, idx) => {
                        const employeeKey = elem.docId || elem.id || elem.firstName
                        return (
                            <div 
                                key={idx} 
                                onClick={() => setSelectedEmployeeId(employeeKey)}
                                className='border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-950/20 cursor-pointer transition-all duration-150 py-3 px-4 flex justify-between items-center rounded-lg bg-black/30 group'
                                title={`Click to view all tasks of ${elem.firstName}`}
                            >
                                <div className='w-1/6 flex items-center gap-2.5'>
                                    <div className='w-7 h-7 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-bold flex items-center justify-center uppercase'>
                                        {elem.firstName ? elem.firstName.charAt(0) : 'E'}
                                    </div>
                                    <h2 className='text-base font-medium text-white capitalize group-hover:text-emerald-300 transition-colors'>
                                        {elem.firstName}
                                    </h2>
                                </div>
                                <h3 className='text-base font-semibold w-1/6 text-center text-blue-400'>{elem.taskCounts?.newTask ?? 0}</h3>
                                <h5 className='text-base font-semibold w-1/6 text-center text-yellow-400'>{elem.taskCounts?.active ?? 0}</h5>
                                <h5 className='text-base font-semibold w-1/6 text-center text-emerald-400'>{elem.taskCounts?.completed ?? 0}</h5>
                                <h5 className='text-base font-semibold w-1/6 text-center text-rose-500'>{elem.taskCounts?.failed ?? 0}</h5>
                                <div className='w-1/6 text-right'>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedEmployeeId(employeeKey)
                                        }}
                                        className='text-xs px-3 py-1.5 rounded bg-emerald-800/80 hover:bg-emerald-600 text-white font-medium transition-colors inline-flex items-center gap-1 shadow-sm'
                                    >
                                        <span>View Work</span>
                                        <span>➔</span>
                                    </button>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className='text-center py-8 text-gray-400 text-sm'>
                        Loading employee data from database...
                    </div>
                )}
            </div>

            {/* Modal to view all work of the clicked employee */}
            {selectedEmployee && (
                <EmployeeWorkModal 
                    employee={selectedEmployee} 
                    onClose={() => setSelectedEmployeeId(null)} 
                />
            )}
        </div>
    )
}

export default AllTask