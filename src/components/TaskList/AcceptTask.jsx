import React, { useState, useContext } from 'react'
import { updateTaskStatus } from '../../firebase/firestoreService'
import { AuthContext } from '../../context/AuthProvider'

const AcceptTask = ({ data, employeeId, taskIndex }) => {
    const [, setUserData] = useContext(AuthContext)
    const [loading, setLoading] = useState(false)

    const handleStatus = async (action) => {
        setLoading(true)
        try {
            const res = await updateTaskStatus(employeeId, taskIndex, action)
            if (res?.localData && setUserData) {
                setUserData(res.localData)
            } else if (res?.updatedTasks && setUserData) {
                setUserData(prev => {
                    if (!prev) return prev
                    const target = String(employeeId).trim().toLowerCase()
                    return prev.map(emp => {
                        if (
                            emp.docId?.toLowerCase() === target ||
                            String(emp.id).toLowerCase() === target ||
                            emp.firstName?.toLowerCase() === target ||
                            emp.email?.toLowerCase() === target
                        ) {
                            return {
                                ...emp,
                                tasks: res.updatedTasks,
                                taskCounts: res.updatedCounts
                            }
                        }
                        return emp
                    })
                })
            }
        } catch (error) {
            console.error(`Failed to mark task as ${action}:`, error)
            alert("Could not update task. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='flex-shrink-0 h-full w-[300px] p-5 bg-amber-500 rounded-xl flex flex-col justify-between shadow-lg'>
            <div>
                <div className='flex justify-between items-center'>
                    <h3 className='bg-red-600 text-xs px-3 py-1 rounded font-medium text-white'>{data.category}</h3>
                    <h4 className='text-xs text-white/90 font-medium'>{data.taskDate}</h4>
                </div>
                <h2 className='mt-4 text-xl font-bold text-white line-clamp-2'>{data.taskTitle}</h2>
                <p className='text-xs text-white/90 mt-2 leading-relaxed'>
                    {data.taskDescription}
                </p>
            </div>
            <div className='flex gap-2 mt-5'>
                <button 
                    onClick={() => handleStatus('complete')}
                    disabled={loading}
                    className='flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors text-white font-medium py-2 px-2 text-xs rounded'
                >
                    {loading ? '...' : 'Completed'}
                </button>
                <button 
                    onClick={() => handleStatus('failed')}
                    disabled={loading}
                    className='flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors text-white font-medium py-2 px-2 text-xs rounded'
                >
                    {loading ? '...' : 'Failed'}
                </button>
            </div>
        </div>
    )
}

export default AcceptTask