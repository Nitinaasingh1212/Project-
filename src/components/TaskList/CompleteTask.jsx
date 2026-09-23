import React from 'react'

const CompleteTask = ({ data }) => {
    return (
        <div className='flex-shrink-0 h-full w-[300px] p-5 bg-emerald-600 rounded-xl flex flex-col justify-between shadow-lg'>
            <div>
                <div className='flex justify-between items-center'>
                    <h3 className='bg-emerald-800 text-xs px-3 py-1 rounded font-medium text-white'>{data.category}</h3>
                    <h4 className='text-xs text-white/90 font-medium'>{data.taskDate}</h4>
                </div>
                <h2 className='mt-4 text-xl font-bold text-white line-clamp-2'>{data.taskTitle}</h2>
                <p className='text-xs text-white/90 mt-2 leading-relaxed'>
                    {data.taskDescription}
                </p>
            </div>
            <div className='mt-5'>
                <div className='w-full bg-emerald-700/80 text-emerald-100 font-semibold py-2 px-2 text-xs rounded text-center border border-emerald-400/30'>
                    ✓ Completed
                </div>
            </div>
        </div>
    )
}

export default CompleteTask