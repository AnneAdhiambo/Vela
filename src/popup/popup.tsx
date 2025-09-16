import React from 'react'
import ReactDOM from 'react-dom/client'
import '../index.css'

function Popup() {
  return (
    <div className="p-4">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <div className="w-6 h-6 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Vela Logo" 
              className="w-4 h-4 object-contain bg-transparent"
            />
          </div>
          <h1 className="text-lg font-bold">Vela</h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Focus & Productivity
        </p>
        <button 
          className="btn-primary w-full"
          onClick={() => chrome.tabs.create({ url: 'chrome://newtab/' })}
        >
          Open Dashboard
        </button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('popup-root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
)