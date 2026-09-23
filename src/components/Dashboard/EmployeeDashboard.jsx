import React, { useState } from 'react'
import Header from '../other/Header'
import TaskListNumbers from '../other/TaskListNumbers'
import TaskList from '../TaskList/TaskList'
import KanbanBoard from '../TaskList/KanbanBoard'

const EmployeeDashboard = (props) => {
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' | 'strip'

  return (
    <div className='p-6 sm:p-10 bg-[#141414] min-h-screen overflow-y-auto text-white'>
        <Header changeUser={props.changeUser} data={props.data}/>
        <TaskListNumbers data={props.data} />

        {/* View Switcher Bar */}
        <div className='mt-8 pt-4 border-t border-gray-800/80 flex items-center justify-between flex-wrap gap-3'>
            <div className='flex items-center gap-2'>
                <span className='text-xs text-gray-400 font-medium'>View Mode:</span>
                <div className='bg-[#1f1f1f] p-1 rounded-xl border border-gray-800 flex gap-1 shadow-inner'>
                    <button
                        onClick={() => setViewMode('kanban')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            viewMode === 'kanban'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <span>📋</span>
                        <span>Drag & Drop Kanban</span>
                    </button>
                    <button
                        onClick={() => setViewMode('strip')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            viewMode === 'strip'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <span>↔</span>
                        <span>Card Carousel</span>
                    </button>
                </div>
            </div>

            <span className='text-xs text-emerald-400/90 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1 rounded-full'>
                💡 Drag any card into &apos;Completed&apos; to mark work finished
            </span>
        </div>

        {/* Active View */}
        {viewMode === 'kanban' ? (
            <KanbanBoard data={props.data} />
        ) : (
            <TaskList data={props.data} />
        )}
    </div>
  )
}

export default EmployeeDashboard