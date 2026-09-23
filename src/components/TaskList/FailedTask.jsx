import React from 'react'

const FailedTask = ({ data }) => {
    return (
        <div className='flex-shrink-0 h-full w-[300px] p-5 bg-rose-700 rounded-xl flex flex-col justify-between shadow-lg'>
            <div>
                <div className='flex justify-between items-center'>
                    <h3 className='bg-rose-900 text-xs px-3 py-1 rounded font-medium text-white'>{data.category}</h3>
                    <h4 className='text-xs text-white/90 font-medium'>{data.taskDate}</h4>
                </div>
                <h2 className='mt-4 text-xl font-bold text-white line-clamp-2'>{data.taskTitle}</h2>
                <p className='text-xs text-white/90 mt-2 leading-relaxed'>
                    {data.taskDescription}
                </p>
            </div>
            <div className='mt-5'>
                <div className='w-full bg-rose-900/80 text-rose-200 font-semibold py-2 px-2 text-xs rounded text-center border border-rose-400/30'>
                    ✕ Failed
                </div>
            </div>
        </div>
    )
}

export default FailedTask