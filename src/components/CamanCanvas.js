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
    </div>
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


// window.Caman.DEBUG = true
let htmlCanvas = "#canvas";
caman(htmlCanvas, image, function () {
  this.render();
});

const CamanCanvas = () => {
  const [presetList, setPresetList] = useState({});
  const [filterList, setFilterList] = useState({});
  const [adjustmentList, setAdjustmentList] = useState({});
  const [presetToggle, setPresetToggle] = useState(false);
  const [filename, setFilename] = useState("");
  const editPaneRef = useRef(null);

  updateImgFn = updateImage;  // Save function so Caman Event listener can call it


  // Throttled could take an options object, but it appears to work fine with default
  const throttled = useRef(throttle((adjustmentList) => (updateImage(adjustmentList)), 100));
  // const prevList = usePrevious(adjustmentList);

  /* Update the image after our adjustments change */
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


  /* Presets toggle button */
  function toggleCollapse() {
    setPresetToggle(!presetToggle);
  }


  function uploadFile(event) {

    const file = event.target.files[0];
    // console.log(file, event.target.id);

    let parent = editPaneRef.current;
    let canvas = parent.firstChild;
    let context = canvas.getContext("2d");

    const reader = new FileReader();
    if (file) {
      setFilename(file.name);
      // read data as URL
      reader.readAsDataURL(file);
    }

    reader.onload = () => {
      let img = new Image();
      img.src = reader.result;

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        canvas.removeAttribute("data-caman-id");

        updateImage(adjustmentList);

        //   caman(canvas, function () {
        //     this.render();
        //   });
      };
    };

  }

  function downloadImage(event) {

    let newFilename = filename ? ("carmen-edited_" + filename) : "carmen-edited.jpg"
    console.log("Boop! Downloading", newFilename);

    let parent = editPaneRef.current;
    let canvas = parent.firstChild;

    // create link
    const link = document.createElement("a");
    link.download = newFilename;
    link.href = canvas.toDataURL("image/jpeg", 1);
    let e = new MouseEvent("click");
    link.dispatchEvent(e);
  }


  return (
    <>
      <div id="editPane" ref={editPaneRef} className="edit-pane bg-gray container-lg text-center p-4 lh-1">
        <img id="canvas" alt="Editing Canvas" className="img-fluid" src={image} />
      </div>

      <div className="row my-3">
        <div className="col pe-0">
          {/* <label htmlFor="formFile" className="form-label">Upload Image</label> */}
          <input className="form-control" type="file" id="formFile" onChange={uploadFile}></input>
        </div>
        <div className="col col-auto text-center">
          {/* <label htmlFor="downloadImage"></label> */}
          <button id="downloadImage" className="btn btn-primary" onClick={downloadImage}>
            <i className="d-block d-md-none bi bi-download"></i>
            <span className="d-none d-md-block">Download Image</span>
          </button>
        </div>
      </div>

      <div id="filterHolder">
        <div id="filterList" className="container overflow-hidden bg-dark text-center my-3 p-2">

          <div className="row row-cols-1 row-cols-md-2 center">
            {createFilterList(filterList, updateFilters)}
          </div>

          <hr />
          <div className="py-2">
            <button className="btn btn-primary" onClick={toggleCollapse} data-bs-target="#collapseTarget" data-bs-toggle="collapse">
              <i className={"px-2 bi " + (presetToggle ? "bi-chevron-compact-up" : "bi-chevron-compact-down")}></i>
              Presets
              <i className={"px-2 bi " + (presetToggle ? "bi-chevron-compact-up" : "bi-chevron-compact-down")}></i>
            </button>
            <div className="collapse pt-2" id="collapseTarget">
              <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 m-1">
                <CreatePresetList presetList={presetList} onClick={updatePresets} />
              </div>
            </div>
          </div>

        </div>
      </div>

    </>
  );
}

export default CamanCanvas;
