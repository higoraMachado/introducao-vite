import styles from './App.module.css'

function App() {
  return (
    <div>
      <h1>Home</h1>
      <p>Exemplo paràgrafo</p>
      <h2 className={styles.titulo2}>Exemplo h2</h2>
      <h3>Exemplo h3</h3>
      <label htmlFor=''>Exemplo label</label>
    </div>
  )
}

export default App