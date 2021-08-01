import CamanCanvas from './components/CamanCanvas';

function App() {

  return (
    <div className="App container text-light">

      <div className="bg-dark px-4 py-1 my-3">
        <h1 className="text-primary display-2">
          <i className="bi bi-image-fill"></i> Carmen
        </h1>
        <div>
          Caman + React <span className="vertical-line"> </span>
          Browser Based Image Editing <span className="vertical-line"> </span>
          <a href="http://camanjs.com/">CamanJS</a> <span className="vertical-line"> </span>
          <a href="https://github.com/Martination/carmen">
            GitHub Repo</a>
        </div>
      </div>

      <CamanCanvas />

      <div className="text-center pb-3">
        &#169; 2021 <a href="https://martination.github.io/">Martin Green</a>
      </div>
    </div>
  );
}

export default App;
