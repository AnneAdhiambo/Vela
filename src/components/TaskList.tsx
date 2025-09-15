import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

interface Task {
  id: string
  text: string
  completed: boolean
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, {
        id: Date.now().toString(),
        text: newTask.trim(),
        completed: false
      }])
      setNewTask('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask()
    }
  }

  return (
    <div data-testid="task-list" className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Tasks</h3>
      
      <div className="space-y-3 mb-4">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-sm">No tasks yet</p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Add your first task below</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 dark:bg-gray-700"
              />
              <span className={`flex-1 ${
                task.completed 
                  ? 'line-through text-gray-400 dark:text-gray-500' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {task.text}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          placeholder="Add new task"
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        
        {isInputFocused && newTask.trim() && (
          <button
            onMouseDown={(e) => e.preventDefault()} // Prevent input blur when clicking button
            onClick={addTask}
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            Add
          </button>
        )}
      </div>
    </div>
  )
}