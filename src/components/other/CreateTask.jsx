import React, { useContext, useState } from 'react'
import { AuthContext } from '../../context/AuthProvider'
import { addTaskToEmployee } from '../../firebase/firestoreService'

const CreateTask = () => {
    const [userData, setUserData] = useContext(AuthContext)

    const [taskTitle, setTaskTitle] = useState('')
    const [taskDescription, setTaskDescription] = useState('')
    const [taskDate, setTaskDate] = useState('')
    const [asignTo, setAsignTo] = useState('')
    const [category, setCategory] = useState('')
    const [loading, setLoading] = useState(false)
    const [statusMessage, setStatusMessage] = useState(null)

    const submitHandler = async (e) => {
        e.preventDefault()

        if (!asignTo.trim()) {
            alert("Please specify which employee to assign the task to.")
            return
        }

        setLoading(true)
        setStatusMessage(null)

        const taskData = {
            taskTitle,
            taskDescription,
            taskDate,
            category
        }

        try {
            const result = await addTaskToEmployee(asignTo, taskData)

            if (result?.localData && setUserData) {
                setUserData(result.localData)
            }

            setStatusMessage({
                type: 'success',
                text: `Task successfully assigned to ${asignTo}!`
            })

            setTaskTitle('')
            setCategory('')
            setAsignTo('')
            setTaskDate('')
            setTaskDescription('')
        } catch (error) {
            console.error("Error creating task:", error)
            setStatusMessage({
                type: 'error',
                text: error.message || 'Failed to create task.'
            })
        } finally {
            setLoading(false)
            setTimeout(() => {
                setStatusMessage(null)
            }, 4000)
        }
    }

    return (
        <div className='p-5 bg-[#1c1c1c] mt-5 rounded'>
            {statusMessage && (
                <div className={`p-3 mb-4 rounded text-sm font-medium ${
                    statusMessage.type === 'success' 
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500' 
                        : 'bg-red-900/60 text-red-300 border border-red-500'
                }`}>
                    {statusMessage.text}
                </div>
            )}
            <form onSubmit={submitHandler} className='flex flex-wrap w-full items-start justify-between'>
                <div className='w-1/2'>
                    <div>
                        <h3 className='text-sm text-gray-300 mb-0.5'>Task Title</h3>
                        <input
                            required
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            className='text-sm py-1 px-2 w-4/5 rounded outline-none bg-transparent border-[1px] border-gray-400 mb-4' 
                            type="text" 
                            placeholder='Make a UI design'
                        />
                    </div>
                    <div>
                        <h3 className='text-sm text-gray-300 mb-0.5'>Date</h3>
                        <input
                            required
                            value={taskDate}
                            onChange={(e) => setTaskDate(e.target.value)}
                            className='text-sm py-1 px-2 w-4/5 rounded outline-none bg-transparent border-[1px] border-gray-400 mb-4 text-white' 
                            type="date" 
                        />
                    </div>
                    <div>
                        <h3 className='text-sm text-gray-300 mb-0.5'>Assign to</h3>
                        {userData && userData.length > 0 ? (
                            <select
                                required
                                value={asignTo}
                                onChange={(e) => setAsignTo(e.target.value)}
                                className='text-sm py-1 px-2 w-4/5 rounded outline-none bg-[#1c1c1c] text-white border-[1px] border-gray-400 mb-4'
                            >
                                <option value="">Select Employee</option>
                                {userData.map((emp, idx) => (
                                    <option key={idx} value={emp.firstName}>
                                        {emp.firstName} ({emp.email})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                required
                                value={asignTo}
                                onChange={(e) => setAsignTo(e.target.value)}
                                className='text-sm py-1 px-2 w-4/5 rounded outline-none bg-transparent border-[1px] border-gray-400 mb-4' 
                                type="text" 
                                placeholder='employee name' 
                            />
                        )}
                    </div>
                    <div>
                        <h3 className='text-sm text-gray-300 mb-0.5'>Category</h3>
                        <input
                            required
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className='text-sm py-1 px-2 w-4/5 rounded outline-none bg-transparent border-[1px] border-gray-400 mb-4' 
                            type="text" 
                            placeholder='design, dev, etc' 
                        />
                    </div>
                </div>

                <div className='w-2/5 flex flex-col items-start'>
                    <h3 className='text-sm text-gray-300 mb-0.5'>Description</h3>
                    <textarea 
                        required
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)} 
                        className='w-full h-44 text-sm py-2 px-4 rounded outline-none bg-transparent border-[1px] border-gray-400'
                        placeholder='Enter detailed task description...'
                    />
                    <button 
                        type="submit"
                        disabled={loading}
                        className='bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 py-3 px-5 rounded text-sm mt-4 w-full font-medium transition-colors'
                    >
                        {loading ? 'Saving to Database...' : 'Create Task'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CreateTask