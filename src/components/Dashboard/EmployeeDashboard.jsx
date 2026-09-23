import React, { useState } from 'react'
import Header from '../other/Header'
import TaskListNumbers from '../other/TaskListNumbers'
import TaskList from '../TaskList/TaskList'
import KanbanBoard from '../TaskList/KanbanBoard'

const EmployeeDashboard = (props) => {
  return (
    <div className='p-6 sm:p-10 bg-[#141414] min-h-screen overflow-y-auto text-white'>
        <Header changeUser={props.changeUser} data={props.data}/>
        <TaskListNumbers data={props.data} />
        <KanbanBoard data={props.data} />
    </div>
  )
}

export default EmployeeDashboard