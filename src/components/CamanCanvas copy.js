// import { render } from '@testing-library/react';
import React, { useState, useEffect } from 'react';
// import ImportScript from './ImportScript'
const caman = window.Caman;
// const caman = require('caman');

// const ImportScript = (resourceUrl) => {
//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src = resourceUrl;
//     script.id = resourceUrl;
//     document.body.appendChild(script);

//     return () => {
//       // document.body.removeChild(script);
//     }
//   }, [resourceUrl]);
// };

/*

function initCanvas() {
  console.log("Initing....")
  let canvas = window.Caman('#canvas-id', function () {
    this.render();
  });
}

export class CamanClass extends React.Component {

  componentDidMount() {
    console.log("mounted")
    initCanvas();

  }







  render() {
    console.log("Importing...")
    ImportScript("caman.full.js");



    let image = "142.jpg";

    // console.log("Init caman")


    // componentDidMount() {
    //   console.log("mounted");
    // };



    // caman.Caman('#canvas-id', function () {
    //   this.render()
    // });

    // useEffect(() => {
    //   console.log("Caman canvas firing")
    //   window.Caman('#canvas-id', image, function () {
    //     this.render();
    //   });
    // }, [image]);


    // const [brightness, setBrightness] = useState(0);
    const brightness = 10;

    // var Caman = require('caman').Caman;

    // Caman("/path/to/file.png", function () {
    //   this.brightness(5);
    //   this.render(function () {
    //     this.save("/path/to/output.png");
    //   });
    // });

    // Caman.DEBUG = true
    let adjustmentList = {};

    // let canvas = window.Caman('#canvas-id', function () {
    //   this.render();
    // });

    console.log("Setting states")


    const brightnessUpdate = (event) => {
      // setBrightness(event.target.value);
      updateImage({ 'brightness': event.target.value });
    };

    const writeBrightness = (event) => {
      console.log(brightness);
      updateImage({ 'brightness': brightness });
    }

    function updateInputFn(filter) {

      console.log(filter);
      console.log();
      console.log(filter.target.attributes['data-filter']);
      console.log(filter.target.attributes.value);
      // let value = filter.value;
      // let adjustment = filter.dataset["filter"];

      // filter.nextElementSibling.innerHTML = value;
      // adjustmentList[adjustment] = value;

      // updateImage(adjustmentList);

    }

    function updateImage(adjustmentList) {
      window.Caman('#canvas-id', function () {
        this.revert();

        for (const filter in adjustmentList) {
          this[filter](adjustmentList[filter]);
          console.log(`${filter}: ${adjustmentList[filter]}`);
        }
        this.render();
      });
    }

    function resetSliders() {
      let sliders = document.getElementsByTagName('input')

      for (const slider of sliders) {
        slider.nextElementSibling.innerHTML = slider.value;
        updateInputFn(slider);
      }
    }

    // resetSliders();


    // let canvas = window.Caman('#canvas-id', function () {
    //   this.render();
    // });
    return (
      <>
        <div className="edit-pane container p-4">
          <p>This is where the image will be.</p>
          <img alt="main" id="canvas-id" src={image}></img>
        </div>

        <div className="Filter">
          <label>Brightness
                <input id="brightness" type="range" min="-100" max="100" step="1"
              data-filter="brightness" onChange={brightnessUpdate} />
            <span className="textInput" onClick={writeBrightness}>{brightness}</span>
          </label>
        </div>
      </>
    );
  }
}

*/


const CamanCanvas = () => {

  let image = "142.jpg";
  let htmlCanvas = "#canvas-id"
  let canvas = caman(htmlCanvas, image, function () {
    this.render();
  });

  // console.log("Init caman")


  // componentDidMount() {
  //   console.log("mounted");
  // };



  // caman.Caman('#canvas-id', function () {
  //   this.render()
  // });

  // useEffect(() => {
  //   console.log("Caman canvas firing")
  //   window.Caman('#canvas-id', image, function () {
  //     this.render();
  //   });
  // }, [image]);


  const [brightness, setBrightness] = useState(0);

  // var Caman = require('caman').Caman;

  // Caman("/path/to/file.png", function () {
  //   this.brightness(5);
  //   this.render(function () {
  //     this.save("/path/to/output.png");
  //   });
  // });

  // Caman.DEBUG = true
  let adjustmentList = {};





  const brightnessUpdate = (event) => {
    setBrightness(event.target.value);
    updateImage({ 'brightness': event.target.value });
  };

  const writeBrightness = (event) => {
    console.log(brightness);
    updateImage({ 'brightness': brightness });
  }

  function updateInputFn(filter) {

    console.log(filter);
    console.log();
    console.log(filter.target.attributes['data-filter']);
    console.log(filter.target.attributes.value);
    // let value = filter.value;
    // let adjustment = filter.dataset["filter"];

    // filter.nextElementSibling.innerHTML = value;
    // adjustmentList[adjustment] = value;

    // updateImage(adjustmentList);

  }

  function updateImage(adjustmentList) {
    caman(htmlCanvas, function () {
      this.revert();

      for (const filter in adjustmentList) {
        this[filter](adjustmentList[filter]);
        // console.log(`${filter}: ${adjustmentList[filter]}`);
      }
      this.render();
    });
  }

  function resetSliders() {
    let sliders = document.getElementsByTagName('input')

    for (const slider of sliders) {
      slider.nextElementSibling.innerHTML = slider.value;
      updateInputFn(slider);
    }
  }

  // resetSliders();


  // let canvas = window.Caman('#canvas-id', function () {
  //   this.render();
  // });

  return (
    <>
      <div className="edit-pane container p-4">
        <p><img alt="before" id="img-id" src={image}></img> Before</p>
        {/* <p><canvas id="canvas-id"></canvas> After</p> */}
        <p><img alt="after" id="canvas-id" src={image}></img> After</p>

      </div>

      <div className="Filter">
        <label>Brightness
          <input id="brightness" type="range" min="-100" max="100" step="1"
            data-filter="brightness" onChange={brightnessUpdate} />
          <span className="textInput" onClick={writeBrightness}>{brightness}</span>
        </label>
      </div>
    </>
  );
}


export default CamanCanvas

// export default CamanClass
