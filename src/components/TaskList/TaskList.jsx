import React from 'react'
import AcceptTask from './AcceptTask'
import NewTask from './NewTask'
import CompleteTask from './CompleteTask'
import FailedTask from './FailedTask'

const TaskList = ({ data }) => {
    const employeeId = data.docId || data.id || data.firstName

    if (!data.tasks || data.tasks.length === 0) {
        return (
            <div className='mt-16 p-8 text-center text-gray-400 bg-[#1c1c1c] rounded-xl'>
                <p className='text-lg font-medium'>No tasks assigned yet.</p>
                <p className='text-sm text-gray-500 mt-1'>Check back later or contact your administrator.</p>
            </div>
        )
    }

    return (
        <div id='tasklist' className='h-[320px] min-h-[300px] overflow-x-auto flex items-center justify-start gap-5 flex-nowrap w-full py-2 mt-12'>
            {data.tasks.map((elem, idx) => {
                if (elem.active) {
                    return <AcceptTask key={idx} data={elem} employeeId={employeeId} taskIndex={idx} />
                }
                if (elem.newTask) {
                    return <NewTask key={idx} data={elem} employeeId={employeeId} taskIndex={idx} />
                }
                if (elem.completed) {
                    return <CompleteTask key={idx} data={elem} employeeId={employeeId} taskIndex={idx} />
                }
                if (elem.failed) {
                    return <FailedTask key={idx} data={elem} employeeId={employeeId} taskIndex={idx} />
                }
                return null
            })}
        </div>
    )
}

export default TaskList