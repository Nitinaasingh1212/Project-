import React from 'react'

const TaskListNumbers = ({ data }) => {
  const counts = data?.taskCounts || {
    newTask: 0,
    completed: 0,
    active: 0,
    failed: 0
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10'>
        <div className='rounded-xl py-6 px-7 bg-blue-500 shadow-md'>
            <h2 className='text-3xl font-bold text-white'>{counts.newTask}</h2>
            <h3 className='text-lg mt-0.5 font-medium text-white/90'>New Tasks</h3>
        </div>
        <div className='rounded-xl py-6 px-7 bg-emerald-600 shadow-md'>
            <h2 className='text-3xl font-bold text-white'>{counts.completed}</h2>
            <h3 className='text-lg mt-0.5 font-medium text-white/90'>Completed Tasks</h3>
        </div>
        <div className='rounded-xl py-6 px-7 bg-amber-500 shadow-md'>
            <h2 className='text-3xl font-bold text-white'>{counts.active}</h2>
            <h3 className='text-lg mt-0.5 font-medium text-white/90'>Accepted Tasks</h3>
        </div>
        <div className='rounded-xl py-6 px-7 bg-rose-600 shadow-md'>
            <h2 className='text-3xl font-bold text-white'>{counts.failed}</h2>
            <h3 className='text-lg mt-0.5 font-medium text-white/90'>Failed Tasks</h3>
        </div>
    </div>
  )
}

export default TaskListNumbers