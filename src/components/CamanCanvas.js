import { useState, useEffect, useRef } from 'react';
import { Button } from 'bootstrap';

import FilterListItem from './FilterListItem'
import usePrevious from './usePrevious'
const caman = window.Caman;


// TO DO:
// channels {red: [-100,100], green: [-100,100], blue:[-100:100]}
// stackBlur [0, 20]?
// colorize [R,G,B, [0-100]] || ['#eee', [0-100]]
// curves [[R,G,B], [P0x,P1x], [P2], [P3], [P4]]
// fillColor [R,G,B] || ['#eee']
// Greyscale(), Invert()

// Stage 2
// Crop, Resize, Preset strength
// vignette, rectangularVignette, tiltShift, radialBlur,
// boxBlur?, heavyRadialBlur, gaussianBlur, motionBlur,
// edgeEnhance, edgeDetect, emboss, posterize,


// function PresetButtonOrig({ preset, onClick }) {
//   var [button, setButton] = useState(false);
//   const buttonRef = useRef();

//   useEffect(() => {
//     var myButton = buttonRef.current
//     var bsButton = Button.getInstance(myButton)

//     if (!bsButton) { bsButton = new Button(myButton, { toggle: "button" }) }
//     else { bsButton.toggle(); }

//   }, [button])

//   return (
//     <div className="col p-1 d-grid">
//       <button className="btn btn-primary" ref={buttonRef} id={preset}
//         onClick={(event) => { setButton(!button); onClick(event) }} type="button">
//         {`${button ? 'on' : 'off'} - ${preset}`}
//       </button>
//     </div >
//   )
// }

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


// window.Caman.DEBUG = true

// let image = "WP.png";
let image = "142.jpg";
let htmlCanvas = "#canvas"
// let canvas =
caman(htmlCanvas, image, function () {
  this.render();
});

let lastExecution = 0;
const delay = 100; // debounce for 100ms (limit excessive rendering)
// Currently debounce doesn't work - it won't update to the most recent
// if it's changing quickly

const CamanCanvas = () => {

  /* Update the image after our adjustments change */
  const [presetList, setPresetList] = useState({});
  const [filterList, setFilterList] = useState({});
  const [adjustmentList, setAdjustmentList] = useState({});

  const prevList = usePrevious(adjustmentList);
  useEffect(() => {
    // console.log("Updating")
    if (JSON.stringify(prevList) !== JSON.stringify(adjustmentList)
      && (lastExecution + delay) < Date.now()) {
      // console.log("Goin")
      updateImage(adjustmentList);
      lastExecution = Date.now();
    }
  }, [adjustmentList, prevList]);

  /* Combine presets and filters into master adjustment list */
  useEffect(() => {
    const newList = { ...presetList, ...filterList }
    setAdjustmentList(newList);
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
    }
    else {
      newList = { ...filterList, [filter]: value };
    }

    if (JSON.stringify(newList) !== JSON.stringify(filterList)) {
      setFilterList(newList);
    }
  }

  /* Button Callback */
  const updatePresets = (event) => {
    const preset = event.target.id;

    console.log("Updating preset", preset);

    let currentPresets = {};
    if (!presetList[preset]) { currentPresets[preset] = 1; }

    setPresetList(currentPresets);
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
            {createFilterList(filterList, updateFilters)}
          </div>

          <hr />

          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 m-1">
            {/* <PresetButtonOrig preset={"lomo"} onClick={updatePresets} />
            <PresetButtonOrig preset={"hazyDays"} onClick={updatePresets} />
            <PresetButtonOrig preset={"vintage"} onClick={updatePresets} /> */}
            {/* <PresetButton preset={"vintage"} onClick={updatePresets} /> */}
            <CreatePresetList presetList={presetList} onClick={updatePresets} />
          </div>

          <hr />

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
