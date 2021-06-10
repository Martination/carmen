import { useState, useEffect, useRef } from 'react';
import { Button } from 'bootstrap';
import throttle from 'lodash/throttle';

import FilterListItem from './FilterListItem'
import image from './../WP.png'
// import image from './../142.jpg'

// import usePrevious from './usePrevious'
const caman = window.Caman;


// TO DO:
// channels {red: [-100,100], green: [-100,100], blue:[-100:100]}
// stackBlur [0, 20]?
// colorize [R,G,B, [0-100]] || ['#eee', [0-100]]
// curves [[R,G,B], [P0x,P1x], [P2], [P3], [P4]]
// fillColor [R,G,B] || ['#eee']
// Greyscale(), Invert()

// Stage 2
// Crop, Resize, Preset strength, undo/redo
// vignette, rectangularVignette, tiltShift, radialBlur,
// boxBlur?, heavyRadialBlur, gaussianBlur, motionBlur,
// edgeEnhance, edgeDetect, emboss, posterize,


// To Do: Change list of presets to include pretty names
function PresetButton({ preset, presetName, onClick, active }) {
  const buttonRef = useRef();

  var myButton = buttonRef.current
  var bsButton = Button.getInstance(myButton)

  if (!bsButton) { bsButton = new Button(myButton, { toggle: "button" }) }

  return (
    <div className="col p-1 d-grid">
      <button className={`btn btn-primary ${active ? 'active' : null}`} ref={buttonRef} id={preset}
        onClick={(event) => { onClick(event) }} type="button">
        {`${presetName}`}
      </button>
    </div >
  )
}

function CreatePresetList({ presetList, onClick }) {
  const presets = [
    "vintage", "lomo", "clarity", "sinCity", "sunrise", "crossProcess", "orangePeel",
    "love", "grungy", "jarques", "pinhole", "oldBoot", "glowingSun",
    "hazyDays", "herMajesty", "nostalgia", "hemingway", "concentrate"
  ];

  const presetsPretty = [
    "Vintage", "Lomo", "Clarity", "Sin City", "Sunrise", "Cross Process", "Orange Peel",
    "Love", "Grungy", "Jarques", "Pinhole", "Old Boot", "Glowing Sun",
    "Hazy Days", "Her Majesty", "Nostalgia", "Hemingway", "Concentrate"
  ];

  let buttonList = []
  for (const [index, preset] of presets.entries()) {
    let isActive = presetList[preset] ? true : false
    buttonList.push(
      <PresetButton key={preset} preset={preset} presetName={presetsPretty[index]}
        onClick={onClick} active={isActive} />
    )
  }
  return buttonList;
}

function createFilterList(filterList, onChange) {
  // -100 to 100
  const filtersFullRange = ["brightness", "contrast", "vibrance", "saturation", "exposure"];
  // 0 to 100
  const filtersHalfRange = ["hue", "sepia", "noise", "sharpen", "clip"];
  const filtersSpecial = { "gamma": { "min": 0, "init": 1, "max": 10, "step": 0.1 } };

  let rangeList = {}

  const rangeFull = { "min": -100, "init": 0, "max": 100 }
  // Must be for...of; for...in replaces names with indicies
  for (const filter of filtersFullRange) { rangeList[filter] = rangeFull; }

  const rangeHalf = { "min": 0, "init": 0, "max": 100 }
  for (const filter of filtersHalfRange) { rangeList[filter] = rangeHalf; }
  rangeList = { ...rangeList, ...filtersSpecial };

  let filters = [];
  // Must be for...in, rangeList isn't iterable
  for (const filter in rangeList) {
    filters.push(
      <FilterListItem key={filter} filter={filter} range={rangeList[filter]}
        filterList={filterList} onChange={onChange} />
    )
  }

  return filters;
}


let isRendering = false;
let prevRenderList = {}, curRenderList = {};
let backlog = 0;
let updateImgFn = () => { };
const throttledEventListen = throttle((curRenderList) => (updateImgFn(curRenderList)), 1000);

caman.Event.listen("processStart", function (job) {
  // console.log("Start:", job.name);
  isRendering = true;
});

caman.Event.listen("processComplete", function (job) {
  // console.log("Finish:", job.name);
  isRendering = false;
  backlog = 0;
  if (JSON.stringify(prevRenderList) !== JSON.stringify(curRenderList)) {
    // console.log("Updating from prev render", prevRenderList, curRenderList)
    // updateImgFn(curRenderList);
    throttledEventListen(curRenderList);
  }
});


const CamanCanvas = () => {
  // window.Caman.DEBUG = true
  let htmlCanvas = "#canvas"
  caman(htmlCanvas, image, function () {
    this.render();
  });
  updateImgFn = updateImage;  // Save function so Caman Event listener can call it

  /* Update the image after our adjustments change */
  const [presetList, setPresetList] = useState({});
  const [filterList, setFilterList] = useState({});
  const [adjustmentList, setAdjustmentList] = useState({});

  // Throttled could take an options object, but it appears to work fine with default
  const throttled = useRef(throttle((adjustmentList) => (updateImage(adjustmentList)), 100));
  // const prevList = usePrevious(adjustmentList);
  useEffect(() => {
    // if (JSON.stringify(prevList) !== JSON.stringify(adjustmentList)) {
    if (JSON.stringify(prevRenderList) !== JSON.stringify(adjustmentList)) {

      if (!isRendering) {
        if (backlog) {
          isRendering = true;
        }
        // console.log("Throttle rendering with", adjustmentList, backlog);
        throttled.current(adjustmentList);
        backlog += 1;
      }
      // else {
      //   console.log("Skipped, rendering");
      // }

    }
  }, [adjustmentList]);

  /* Combine presets and filters into master adjustment list */
  useEffect(() => {
    const newList = { ...presetList, ...filterList }
    setAdjustmentList(curRenderList = newList);
  }, [filterList, presetList]);


  /* Sliders Callback */
  const updateFilters = (event, init) => {
    const filter = event.target.name;
    const value = parseFloat(event.target.value);
    console.log("Updating", filter);

    let newList;
    if (value === init) {
      console.log(`Reset ${filter} to default`)
      newList = { ...filterList };
      delete newList[filter];
    } else {
      newList = { ...filterList, [filter]: value };
    }

    // if (JSON.stringify(newList) !== JSON.stringify(filterList)) {
    setFilterList(newList);
    // }
  }

  /* Button Callback */
  const updatePresets = (event) => {
    const preset = event.target.id;

    // console.log("Updating preset", preset);

    let currentPresets = {};
    if (!presetList[preset]) { currentPresets[preset] = 1; }

    setPresetList(currentPresets);
  }

  function updateImage(adjustmentList) {
    prevRenderList = adjustmentList;
    caman(htmlCanvas, function () {
      console.log("~~~~ UPDATE IMAGE ~~~~")
      console.log(adjustmentList)

      this.revert(false);
      for (const filter in adjustmentList) {

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
            {createFilterList(filterList, updateFilters)}
          </div>

          <hr />
          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 m-1">
            <CreatePresetList presetList={presetList} onClick={updatePresets} />
          </div>

        </div>
      </div>

    </>
  );
}

export default CamanCanvas;
