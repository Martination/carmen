import CamanCanvas from './components/CamanCanvas'

function App() {

  return (
    <div className="App text-light">

      <div className="container bg-dark px-4 py-1 my-3">
        <h1 className="text-primary display-2">
          <i className="bi bi-image-fill"></i> Caman + React
        </h1>
      </div>

      <CamanCanvas />

    </div>
  );
}

export default App;
