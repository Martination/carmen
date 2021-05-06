import CamanCanvas from './components/CamanCanvas'

function App() {

  return (
    <div className="App container dark-gray mt-5">
      <h1 className="text-primary">
        <i className="bi bi-image-fill"></i> Caman + React
        </h1>
      <p>Header Text Here</p>

      <CamanCanvas />

    </div>
  );
}

export default App;
