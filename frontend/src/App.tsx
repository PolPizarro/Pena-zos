import { app } from './firebase/config'

function App() {
  return (
    <main>
      <h1>Peña Zos</h1>
      <p>Proyecto Firebase conectado: {app.options.projectId}</p>
    </main>
  )
}

export default App
