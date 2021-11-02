import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import App from './app'

const container = document.querySelector('#root')
const root = ReactDOM.createRoot(container)

root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
