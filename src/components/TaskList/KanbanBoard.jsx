import React, { useState, useContext } from 'react'
import { AuthContext } from '../../context/AuthProvider'
import { updateTaskStatus } from '../../firebase/firestoreService'

const KanbanBoard = ({ data }) => {
    const [, setUserData] = useContext(AuthContext)
    const [draggedTaskInfo, setDraggedTaskInfo] = useState(null)
    const [dragOverColumn, setDragOverColumn] = useState(null)
    const [updatingIndex, setUpdatingIndex] = useState(null)
    const [toastMessage, setToastMessage] = useState(null)

    const employeeId = data?.docId || data?.id || data?.firstName
    const tasks = data?.tasks || []

    const showToast = (message) => {
        setToastMessage(message)
        setTimeout(() => setToastMessage(null), 3500)
    }

    // Categorize tasks along with their original index in data.tasks
    const columns = [
        {
            id: 'new',
            title: 'New Tasks',
            actionName: 'new',
            icon: '📥',
            color: 'blue',
            badgeBg: 'bg-blue-950/70 border-blue-500/50 text-blue-300',
            headerBg: 'from-blue-900/40 to-blue-950/20 border-blue-600/40',
            glowBorder: 'border-blue-400 bg-blue-950/30',
            tasks: tasks
                .map((task, originalIndex) => ({ task, originalIndex }))
                .filter(({ task }) => task.newTask && !task.active && !task.completed && !task.failed)
        },
        {
            id: 'active',
            title: 'In Progress',
            actionName: 'accept',
            icon: '⚡',
            color: 'amber',
            badgeBg: 'bg-amber-950/70 border-amber-500/50 text-amber-300',
            headerBg: 'from-amber-900/40 to-amber-950/20 border-amber-600/40',
            glowBorder: 'border-amber-400 bg-amber-950/30',
            tasks: tasks
                .map((task, originalIndex) => ({ task, originalIndex }))
                .filter(({ task }) => task.active && !task.completed && !task.failed)
        },
        {
            id: 'completed',
            title: 'Completed',
            actionName: 'complete',
            icon: '✅',
            color: 'emerald',
            badgeBg: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300',
            headerBg: 'from-emerald-900/40 to-emerald-950/20 border-emerald-600/40',
            glowBorder: 'border-emerald-400 bg-emerald-950/30',
            tasks: tasks
                .map((task, originalIndex) => ({ task, originalIndex }))
                .filter(({ task }) => task.completed)
        },
        {
            id: 'failed',
            title: 'Failed / Blocked',
            actionName: 'failed',
            icon: '❌',
            color: 'rose',
            badgeBg: 'bg-rose-950/70 border-rose-500/50 text-rose-300',
            headerBg: 'from-rose-900/40 to-rose-950/20 border-rose-600/40',
            glowBorder: 'border-rose-400 bg-rose-950/30',
            tasks: tasks
                .map((task, originalIndex) => ({ task, originalIndex }))
                .filter(({ task }) => task.failed)
        }
    ]

    const handleDragStart = (e, originalIndex, currentStatus, taskTitle) => {
        setDraggedTaskInfo({ originalIndex, currentStatus, taskTitle })
        e.dataTransfer.setData('text/plain', JSON.stringify({ originalIndex, currentStatus }))
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragEnd = () => {
        setDraggedTaskInfo(null)
        setDragOverColumn(null)
    }

    const handleDragOver = (e, columnId) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (dragOverColumn !== columnId) {
            setDragOverColumn(columnId)
        }
    }

    const handleDragLeave = (e, columnId) => {
        if (e.currentTarget.contains(e.relatedTarget)) return
        if (dragOverColumn === columnId) {
            setDragOverColumn(null)
        }
    }

    const handleDrop = async (e, targetColumn) => {
        e.preventDefault()
        setDragOverColumn(null)

        let dragData = draggedTaskInfo
        if (!dragData) {
            try {
                const parsed = JSON.parse(e.dataTransfer.getData('text/plain'))
                dragData = parsed
            } catch (err) {
                return
            }
        }

        if (!dragData) return

        const { originalIndex, currentStatus, taskTitle } = dragData

        // If dropped into the same column, do nothing
        if (currentStatus === targetColumn.id) return

        setUpdatingIndex(originalIndex)

        // Map column to action name
        const action = targetColumn.actionName

        try {
            const res = await updateTaskStatus(employeeId, originalIndex, action)

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

            if (targetColumn.id === 'completed') {
                showToast(`🎉 "${taskTitle || 'Task'}" marked as Completed! Great job!`)
            } else if (targetColumn.id === 'active') {
                showToast(`⚡ "${taskTitle || 'Task'}" moved to In Progress!`)
            } else {
                showToast(`📋 Task moved to ${targetColumn.title}`)
            }
        } catch (error) {
            console.error("Failed to move task:", error)
            alert("Could not update task status. Please try again.")
        } finally {
            setUpdatingIndex(null)
            setDraggedTaskInfo(null)
        }
    }

    return (
        <div className='mt-8'>
            {/* Notification Toast */}
            {toastMessage && (
                <div className='fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce'>
                    <span className='text-xl'>✅</span>
                    <span className='text-sm font-medium'>{toastMessage}</span>
                </div>
            )}

            {/* Kanban Columns Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start mt-8'>
                {columns.map((column) => {
                    const isOver = dragOverColumn === column.id
                    return (
                        <div
                            key={column.id}
                            onDragOver={(e) => handleDragOver(e, column.id)}
                            onDragLeave={(e) => handleDragLeave(e, column.id)}
                            onDrop={(e) => handleDrop(e, column)}
                            className={`flex flex-col rounded-2xl bg-[#161616] border-2 transition-all duration-200 min-h-[460px] max-h-[75vh] p-3.5 shadow-xl ${isOver
                                    ? `${column.glowBorder} scale-[1.01] shadow-2xl shadow-emerald-950/30`
                                    : 'border-gray-800/80 hover:border-gray-700'
                                }`}
                        >
                            {/* Column Header */}
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${column.headerBg} border flex items-center justify-between mb-3.5`}>
                                <div className='flex items-center gap-2'>
                                    <span className='text-lg'>{column.icon}</span>
                                    <h3 className='font-bold text-sm text-white'>{column.title}</h3>
                                </div>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${column.badgeBg}`}>
                                    {column.tasks.length}
                                </span>
                            </div>

                            {/* Drop Zone Indicator when dragging */}
                            {isOver && (
                                <div className='mb-3 p-3 border-2 border-dashed border-emerald-400/80 bg-emerald-950/30 rounded-xl text-center text-xs text-emerald-300 font-semibold animate-pulse'>
                                    📥 Drop here to mark as {column.title}
                                </div>
                            )}

                            {/* Column Task Cards */}
                            <div className='flex-1 overflow-y-auto space-y-3 pr-1'>
                                {column.tasks.length > 0 ? (
                                    column.tasks.map(({ task, originalIndex }) => {
                                        const isBeingUpdated = updatingIndex === originalIndex
                                        const isBeingDragged = draggedTaskInfo?.originalIndex === originalIndex

                                        return (
                                            <div
                                                key={originalIndex}
                                                draggable={!isBeingUpdated}
                                                onDragStart={(e) => handleDragStart(e, originalIndex, column.id, task.taskTitle)}
                                                onDragEnd={handleDragEnd}
                                                className={`group p-4 rounded-xl border bg-[#1f1f1f] transition-all cursor-grab active:cursor-grabbing select-none ${isBeingDragged
                                                        ? 'opacity-40 border-dashed border-gray-500 scale-95'
                                                        : 'border-gray-700/60 hover:border-gray-500 hover:shadow-lg hover:-translate-y-0.5'
                                                    } ${isBeingUpdated ? 'pointer-events-none opacity-60' : ''}`}
                                            >
                                                {/* Card Header */}
                                                <div className='flex items-center justify-between gap-2 mb-2'>
                                                    <span className='px-2 py-0.5 text-[11px] font-semibold rounded bg-black/40 text-gray-300 border border-gray-700/80'>
                                                        {task.category || 'General'}
                                                    </span>
                                                    <div className='flex items-center gap-1.5'>
                                                        <span className='text-[10px] text-gray-400 font-mono'>
                                                            {task.taskDate || 'No date'}
                                                        </span>
                                                        <span className='text-gray-500 group-hover:text-gray-300 text-xs font-bold' title="Drag to move">
                                                            ⋮⋮
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Task Title */}
                                                <h4 className='text-sm font-bold text-white leading-snug mb-1.5 group-hover:text-emerald-300 transition-colors'>
                                                    {task.taskTitle}
                                                </h4>

                                                {/* Task Description */}
                                                <p className='text-xs text-gray-400 line-clamp-3 leading-relaxed mb-3'>
                                                    {task.taskDescription || 'No description.'}
                                                </p>

                                                {/* Footer Status & Quick Drag Hint */}
                                                <div className='pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400'>
                                                    <span className='flex items-center gap-1'>
                                                        <span className='text-xs'>🖐</span>
                                                        <span>Drag to move</span>
                                                    </span>
                                                    {column.id === 'completed' && (
                                                        <span className='text-emerald-400 font-semibold flex items-center gap-1'>
                                                            <span>✓</span> Done
                                                        </span>
                                                    )}
                                                    {column.id === 'active' && (
                                                        <span className='text-amber-400 font-semibold flex items-center gap-1'>
                                                            <span>⚡</span> Active
                                                        </span>
                                                    )}
                                                    {column.id === 'new' && (
                                                        <span className='text-blue-400 font-semibold flex items-center gap-1'>
                                                            <span>•</span> New
                                                        </span>
                                                    )}
                                                    {column.id === 'failed' && (
                                                        <span className='text-rose-400 font-semibold flex items-center gap-1'>
                                                            <span>✕</span> Failed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className='h-48 border-2 border-dashed border-gray-800 rounded-xl flex flex-col items-center justify-center p-4 text-center text-gray-500'>
                                        <span className='text-2xl mb-1 opacity-50'>{column.icon}</span>
                                        <p className='text-xs font-medium text-gray-400'>No tasks here</p>
                                        <p className='text-[10px] text-gray-600 mt-0.5'>Drop tasks here to transition</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default KanbanBoard
