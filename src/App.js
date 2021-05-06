import CamanCanvas from './components/CamanCanvas'

// import { BallResizer } from "./BallResizer"
// import "./styles.css";


function App() {

  // ImportScript("caman.full.js");

  return (
    <div className="App container dark-gray mt-5">
      <h1 className="text-primary">
        <i className="bi bi-diagram-2-fill"></i> Caman + React
        </h1>
      <p>Hey, what's up {"steve"}?</p>
      <p>I really like that repo {"from CamanJS"}</p>


      <CamanCanvas />


      {/* <div className="BallApp">
        <BallResizer initialSize={200} minSize={100} maxSize={300} />
      </div> */}

    </div>
  );
}

export default App;
