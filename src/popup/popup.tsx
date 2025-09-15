import React from 'react'
import ReactDOM from 'react-dom/client'
import '../index.css'

function Popup() {
  return (
    <div className="p-4">
      <div className="text-center">
        <h1 className="text-lg font-bold mb-2">Vela</h1>
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