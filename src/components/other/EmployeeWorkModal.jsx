import React, { useState, useEffect } from 'react'

const EmployeeWorkModal = ({ employee, onClose }) => {
    const [filter, setFilter] = useState('all')

    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    if (!employee) return null

    const tasks = employee.tasks || []
    const counts = employee.taskCounts || {
        active: 0,
        newTask: 0,
        completed: 0,
        failed: 0
    }

    const filteredTasks = tasks.filter((task) => {
        if (filter === 'active') return task.active
        if (filter === 'newTask') return task.newTask
        if (filter === 'completed') return task.completed
        if (filter === 'failed') return task.failed
        return true
    })

    const getStatusBadge = (task) => {
        if (task.completed) {
            return (
                <span className='px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center gap-1'>
                    <span className='w-1.5 h-1.5 rounded-full bg-emerald-400'></span>
                    Completed
                </span>
            )
        }
        if (task.active) {
            return (
                <span className='px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-950/80 text-yellow-400 border border-yellow-500/40 flex items-center gap-1'>
                    <span className='w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse'></span>
                    Active / In Progress
                </span>
            )
        }
        if (task.failed) {
            return (
                <span className='px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-950/80 text-rose-400 border border-rose-500/40 flex items-center gap-1'>
                    <span className='w-1.5 h-1.5 rounded-full bg-rose-400'></span>
                    Failed
                </span>
            )
        }
        if (task.newTask) {
            return (
                <span className='px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-950/80 text-blue-400 border border-blue-500/40 flex items-center gap-1'>
                    <span className='w-1.5 h-1.5 rounded-full bg-blue-400'></span>
                    New Task
                </span>
            )
        }
        return (
            <span className='px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-800 text-gray-300'>
                Pending
            </span>
        )
    }

    return (
        <div 
            className='fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4'
            onClick={onClose}
        >
            <div 
                className='bg-[#181818] border border-gray-700/60 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className='p-6 border-b border-gray-800 flex items-center justify-between bg-[#1f1f1f]'>
                    <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-full bg-emerald-600/30 border border-emerald-500 flex items-center justify-center text-xl font-bold text-emerald-400 uppercase'>
                            {employee.firstName ? employee.firstName.charAt(0) : 'E'}
                        </div>
                        <div>
                            <div className='flex items-center gap-2'>
                                <h2 className='text-2xl font-bold text-white capitalize'>
                                    {employee.firstName}&apos;s Work & Tasks
                                </h2>
                                <span className='text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono'>
                                    ID: {employee.id || 'N/A'}
                                </span>
                            </div>
                            <p className='text-sm text-gray-400 mt-0.5'>
                                {employee.email || 'No email registered'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className='w-9 h-9 rounded-full bg-gray-800/80 hover:bg-red-600 hover:text-white transition-colors text-gray-400 flex items-center justify-center text-lg'
                        title="Close (Esc)"
                    >
                        ✕
                    </button>
                </div>

                {/* Status Counters Strip */}
                <div className='grid grid-cols-2 sm:grid-cols-5 gap-3 p-5 bg-[#141414] border-b border-gray-800/80'>
                    <div className='bg-[#1e1e1e] p-3 rounded-xl border border-gray-800 flex flex-col'>
                        <span className='text-xs text-gray-400 font-medium'>Total Assigned</span>
                        <span className='text-2xl font-bold text-white mt-1'>{tasks.length}</span>
                    </div>
                    <div className='bg-[#1e1e1e] p-3 rounded-xl border border-blue-900/40 flex flex-col'>
                        <span className='text-xs text-blue-400 font-medium'>New Tasks</span>
                        <span className='text-2xl font-bold text-blue-400 mt-1'>{counts.newTask ?? 0}</span>
                    </div>
                    <div className='bg-[#1e1e1e] p-3 rounded-xl border border-yellow-900/40 flex flex-col'>
                        <span className='text-xs text-yellow-400 font-medium'>Active / Ongoing</span>
                        <span className='text-2xl font-bold text-yellow-400 mt-1'>{counts.active ?? 0}</span>
                    </div>
                    <div className='bg-[#1e1e1e] p-3 rounded-xl border border-emerald-900/40 flex flex-col'>
                        <span className='text-xs text-emerald-400 font-medium'>Completed</span>
                        <span className='text-2xl font-bold text-emerald-400 mt-1'>{counts.completed ?? 0}</span>
                    </div>
                    <div className='bg-[#1e1e1e] p-3 rounded-xl border border-rose-900/40 flex flex-col'>
                        <span className='text-xs text-rose-400 font-medium'>Failed</span>
                        <span className='text-2xl font-bold text-rose-400 mt-1'>{counts.failed ?? 0}</span>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className='px-6 pt-4 pb-2 flex gap-2 overflow-x-auto border-b border-gray-800 bg-[#181818]'>
                    {[
                        { id: 'all', label: 'All Tasks', count: tasks.length },
                        { id: 'newTask', label: 'New', count: counts.newTask ?? 0 },
                        { id: 'active', label: 'Active', count: counts.active ?? 0 },
                        { id: 'completed', label: 'Completed', count: counts.completed ?? 0 },
                        { id: 'failed', label: 'Failed', count: counts.failed ?? 0 },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                filter === tab.id
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                filter === tab.id ? 'bg-emerald-800 text-white' : 'bg-gray-700 text-gray-300'
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Tasks List */}
                <div className='flex-1 overflow-y-auto p-6 space-y-4'>
                    {filteredTasks.length > 0 ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {filteredTasks.map((task, idx) => (
                                <div 
                                    key={idx}
                                    className='bg-[#212121] border border-gray-700/50 hover:border-gray-600 rounded-xl p-5 flex flex-col justify-between transition-all hover:shadow-lg'
                                >
                                    <div>
                                        <div className='flex items-center justify-between gap-2 mb-3'>
                                            <span className='px-2.5 py-0.5 text-xs font-medium rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'>
                                                {task.category || 'General'}
                                            </span>
                                            <span className='text-xs text-gray-400 font-mono'>
                                                📅 {task.taskDate || 'No date'}
                                            </span>
                                        </div>
                                        <h3 className='text-base font-bold text-white mb-2 leading-snug'>
                                            {task.taskTitle}
                                        </h3>
                                        <p className='text-xs text-gray-300 leading-relaxed line-clamp-4'>
                                            {task.taskDescription || 'No description provided.'}
                                        </p>
                                    </div>
                                    <div className='mt-4 pt-3 border-t border-gray-800 flex items-center justify-between'>
                                        <span className='text-[11px] text-gray-400'>
                                            Status:
                                        </span>
                                        {getStatusBadge(task)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='py-16 text-center text-gray-400 flex flex-col items-center justify-center'>
                            <span className='text-4xl mb-3'>📋</span>
                            <p className='text-base font-medium text-gray-300'>
                                {tasks.length === 0 
                                    ? `No tasks assigned to ${employee.firstName} yet.` 
                                    : `No tasks found in '${filter}' category.`}
                            </p>
                            <p className='text-xs text-gray-500 mt-1 max-w-sm'>
                                {tasks.length === 0 
                                    ? 'You can create and assign new tasks using the task assignment form in the Admin Dashboard.' 
                                    : 'Switch filters or create a new task for this employee.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className='p-4 border-t border-gray-800 bg-[#1c1c1c] flex items-center justify-between text-xs text-gray-400'>
                    <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
                    <button
                        onClick={onClose}
                        className='px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors'
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EmployeeWorkModal
