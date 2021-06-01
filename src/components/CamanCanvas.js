import { useState, useEffect, useRef } from 'react';
import { Toast, Button } from 'bootstrap';

import FilterListItem from './FilterListItem'
const caman = window.Caman;

// const { Toast } = bootstrap;

// TO DO:
// channels {red: [-100,100], green: [-100,100], blue:[-100:100]}
// stackBlur [0, 20]?
// colorize [R,G,B, [0-100]] || ['#eee', [0-100]]
// curves [[R,G,B], [P0x,P1x], [P2], [P3], [P4]]
// fillColor [R,G,B] || ['#eee']
// Greyscale(), Invert()

// Stage 2
// Crop, Resize,
// vignette, rectangularVignette, tiltShift, radialBlur,
// boxBlur?, heavyRadialBlur, gaussianBlur, motionBlur,
// edgeEnhance, edgeDetect, emboss, posterize,



function ToastDemo() {
  var [toast, setToast] = useState(false);
  const toastRef = useRef();

  useEffect(() => {
    var myToast = toastRef.current
    var bsToast = Toast.getInstance(myToast)
    // var bsToast = bootstrap.Toast.getInstance(myToast)

    if (!bsToast) {
      // initialize Toast
      console.log("init")
      bsToast = new Toast(myToast, { autohide: false })
      // hide after init
      bsToast.hide()
      setToast(false)
    }
    else {
      // toggle
      console.log("toggle")
      toast ? bsToast.show() : bsToast.hide()

    }
  })

  return (
    <div className="py-2">
      <button className="btn btn-success" onClick={() => setToast(toast => !toast)}>
        Toast {toast ? 'hide' : 'show'}
      </button>
      <div className="toast" role="alert" ref={toastRef}>
        <div className="toast-header">
          <strong className="me-auto">Bootstrap 5</strong>
          <small>4 mins ago</small>
          <button type="button" className="btn-close" onClick={() => setToast(false)} aria-label="Close"></button>
        </div>
        <div className="toast-body">
          Hello, world! This is a toast message.
          </div>
      </div>
    </div>
  )
}

function ButtonDemo() {
  var [button, setButton] = useState(false);
  const buttonRef = useRef();

  useEffect(() => {
    var myButton = buttonRef.current
    var bsButton = Button.getInstance(myButton)
    // var bsButton = bootstrap.Button.getInstance(myButton)

    if (!bsButton) {
      // initialize Button
      // console.log("init")
      bsButton = new Button(myButton, { toggle: "button" })
      // bsButton.toggle()
      // setButton(true)
    }
    else {
      // toggle
      // console.log("toggle")
      bsButton.toggle();
      // button ? bsButton.toggle() : bsButton.toggle()

    }
  })

  return (
    <div className="p-2">
      <button className="btn btn-success" ref={buttonRef} onClick={() => setButton(button => !button)}>
        {`Button ${button ? 'on' : 'off'}`}
      </button>
    </div>
  )
}

function CreateButton() {
  var [button, setButton] = useState(false);
  const buttonRef = useRef();

  useEffect(() => {
    var myButton = buttonRef.current
    var bsButton = Button.getInstance(myButton)

    if (!bsButton) { bsButton = new Button(myButton, { toggle: "button" }) }
    else { bsButton.toggle(); }
  }, [button])

  return (
    <div className="col p-1 d-grid">
      <button className="btn btn-primary" ref={buttonRef} onClick={() => setButton(!button)} type="button">
        {`Button ${button ? 'on' : 'off'}`} - Lomo as a test with long text
          </button>
    </div>
  )
}

// <div className="col p-1 d-grid"><button className="btn btn-primary" data-bs-toggle="button" autoComplete="off" type="button">Button</button></div>

// window.Caman.DEBUG = true

// let image = "WP.png";
let image = "142.jpg";
let htmlCanvas = "#canvas"
// let canvas =
caman(htmlCanvas, image, function () {
  // this["hazyDays"](0);
  // this["lomo"](0);
  this.render();
});

let lastExecution = 0;
const delay = 100; // debounce for 100ms (limit excessive rendering)

const CamanCanvas = () => {

  /* Update the image after our adjustments change */
  const [adjustmentList, setAdjustmentList] = useState({});
  useEffect(() => {
    if ((lastExecution + delay) < Date.now()) {
      updateImage(adjustmentList);
      lastExecution = Date.now();
    }
  }, [adjustmentList]);


  function createFilterList(adjustmentList, onChange) {
    // -100 to 100
    const filtersFullRange = ["brightness", "contrast", "vibrance", "saturation", "exposure"];
    // 0 to 100
    const filtersHalfRange = ["hue", "sepia", "noise", "sharpen", "clip"];
    const filtersSpecial = { "gamma": { "min": 0, "init": 1, "max": 10, "step": 0.1 } };

    // const presets = [
    //   "vintage", "lomo", "clarity", "sinCity", "sunrise", "crossProcess", "orangePeel",
    //   "love", "grungy", "jarques", "pinhole", "oldBoot", "glowingSun",
    //   "hazyDays", "herMajesty", "nostalgia", "hemingway", "concentrate"
    // ];

    let rangeList = {}

    const rangeFull = { "min": -100, "init": 0, "max": 100 }
    // Must be for...of; for...in replaces names with indicies
    for (const filter of filtersFullRange) { rangeList[filter] = rangeFull; }

    const rangeHalf = { "min": 0, "init": 0, "max": 100 }
    for (const filter of filtersHalfRange) { rangeList[filter] = rangeHalf; }
    rangeList = { ...rangeList, ...filtersSpecial };
    // console.log(rangeList);

    const filters = [];
    // Must be for...in, rangeList isn't iterable
    for (const filter in rangeList) {
      // console.log(filter, rangeList[filter])
      filters.push(
        <FilterListItem key={filter} filter={filter} range={rangeList[filter]}
          adjustmentList={adjustmentList} onChange={onChange} />
      )
    }

    return filters;
  }

  function createPresetList(adjustmentList, onChange) {
    // const presets = [
    //   "vintage", "lomo", "clarity", "sinCity", "sunrise", "crossProcess", "orangePeel",
    //   "love", "grungy", "jarques", "pinhole", "oldBoot", "glowingSun",
    //   "hazyDays", "herMajesty", "nostalgia", "hemingway", "concentrate"
    // ];
  }

  /* Sliders Callback */
  const updateFilters = (event, init) => {
    const filter = event.target.name;
    const value = parseFloat(event.target.value);
    console.log("Updating", filter);

    let newList;
    if (value === init) {
      console.log(`Reset ${filter} to default`)
      newList = { ...adjustmentList };
      delete newList[filter];
    }
    else {
      newList = { ...adjustmentList, [filter]: value };
    }

    if (JSON.stringify(newList) !== JSON.stringify(adjustmentList)) {
      setAdjustmentList(newList);
    }
  }

  function updateImage(adjustmentList) {
    caman(htmlCanvas, function () {
      console.log("~~~~ UPDATE IMAGE ~~~~")
      console.log(adjustmentList)

      this.revert(false);
      for (const filter in adjustmentList) {
        // console.log(`${filter}: ${adjustmentList[filter]}`);

        if (this[filter]) {
          this[filter](adjustmentList[filter]);
        } else {
          console.log(`${filter} is not a valid filter.`);
          let newList = { ...adjustmentList };
          delete newList[filter];
          // Invalid filters will usually be at the end of the list because they get removed each render
          // So we can just render and it will look okay until the updated re-render
          this.render();
          setAdjustmentList(newList);
          return;
        }
      }
      this.render();
    });
  }


  return (
    <>



      <div className="edit-pane bg-gray container-lg text-center p-4 lh-1">
        <img alt="Editing Canvas" className="img-fluid" id="canvas" src={image}></img>
      </div>

      <div id="filterHolder">
        <div id="filterList" className="container overflow-hidden bg-dark text-center my-3 p-2">
          <div className="row row-cols-1 row-cols-md-2 center">
            {createFilterList(adjustmentList, updateFilters)}
          </div>

          <hr />

          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 m-1">
            <CreateButton />
            <CreateButton />
            <CreateButton />
          </div>

          <hr />
          {/* "vintage", "lomo", "clarity", "sinCity", "sunrise", "crossProcess", "orangePeel", */}

          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 m-1">
            <div className="col p-1 d-grid">
              <button className="btn btn-primary" type="button" name="hazyDays" data-bs-toggle="button"
                onClick={(event) => console.log(event.target.name)}>Hazy Days</button>
            </div>
            <div className="col p-1 d-grid"><button className="btn btn-primary" data-bs-toggle="button" autoComplete="off" type="button">Button</button></div>
            <div className="col p-1 d-grid"><button className="btn btn-primary" data-bs-toggle="button" autoComplete="off" type="button">Button</button></div>
            <div className="col p-1 d-grid"><button className="btn btn-primary" data-bs-toggle="button" autoComplete="off" type="button">Button</button></div>
            <div className="col p-1 d-grid"><button className="btn btn-primary" data-bs-toggle="button" autoComplete="off" type="button">Button</button></div>
            <div className="col p-1 d-grid"><button className="btn btn-primary" data-bs-toggle="button" autoComplete="off" type="button">Button</button></div>
            <div className="col p-1 d-grid"><button className="btn btn-primary" data-bs-toggle="button" autoComplete="off" type="button">Button</button></div>
            <div className="col p-1 d-grid"><button className="btn btn-primary" data-bs-toggle="button" autoComplete="off" type="button">Button</button></div>
          </div>

          <hr />

          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6">
            <div className="p-1"><label className="btn btn-primary" data-bs-toggle="button">Hazy Dog</label></div>
            <div className="p-1"><label className="btn btn-primary">Lomo</label></div>
            <div className="p-1"><label className="btn btn-primary">Button</label></div>
            <div className="p-1"><label className="btn btn-primary">Button</label></div>
            <div className="p-1"><label className="btn btn-primary">Button</label></div>
            <div className="p-1"><label className="btn btn-primary">Button</label></div>
            <div className="p-1"><label className="btn btn-primary">Button</label></div>
          </div>

          <div className="py-2">
            <button className="btn btn-primary" data-bs-target="#collapseTarget" data-bs-toggle="collapse">
              Toggle collapse
        </button>
            <div className="collapse" id="collapseTarget">
              This is the toggle-able content!
        </div>
          </div>

        </div>


      </div>

    </>
  );
}

export default CamanCanvas;
