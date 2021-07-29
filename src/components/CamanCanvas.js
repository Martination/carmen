import { useState, useEffect, useRef } from 'react';
import { Button } from 'bootstrap';
import throttle from 'lodash/throttle';

import { getImg, getImgBlob, getAlbum, uploadImg } from './ImgurAPI'
import FilterListItem from './FilterListItem'
// import image from './../WP.png'
import image from './../142.jpg'

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
  const [imgurImgData, setImgurImgData] = useState({});
  const editPaneRef = useRef(null);
  const imgurUrlRef = useRef(null);

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
      // console.log(`Reset ${filter} to default`)
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

  /* Take an image object and update the canvas */
  function updateCanvas(img) {
    let parent = editPaneRef.current;
    let canvas = parent.firstChild;
    let context = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0, img.width, img.height);
    canvas.removeAttribute("data-caman-id");

    updateImage(adjustmentList);
  }

  /* Read a file and upate the canvas */
  function setImage(file) {
    const reader = new FileReader();
    if (file) {
      setFilename(file.name);
      // read data as URL
      reader.readAsDataURL(file);
    }

    reader.onload = () => {
      let img = new Image();
      img.src = reader.result;

      img.onload = () => { updateCanvas(img); };
    };
  }


  /* Take the file from the file browser and set it */
  function uploadFile(event) {
    const file = event.target.files[0];
    setImage(file);
  }


  function downloadImage() {

    let newFilename = filename ? ("carmen-edited_" + filename) : "carmen-edited.jpg"
    console.log("Boop! Downloading", newFilename);

    let parent = editPaneRef.current;
    let canvas = parent.firstChild;

    // create link
    const link = document.createElement("a");
    link.download = newFilename;
    link.href = canvas.toDataURL("image/jpeg", 1);
    console.log(link, link.href);
    let e = new MouseEvent("click");
    link.dispatchEvent(e);
  }

  /*

data:image/jpeg;base64,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

  */


  async function importImgur() {
    let form = imgurUrlRef.current;
    let value = form.value;

    // imageID is 7 chars long
    const regex = /\w{7}/g
    const album = /\/gallery\/|\/a\//g

    let imgId;
    if (album.test(value)) {
      imgId = value.split(album)[1];
      imgId = imgId.substring(0, 7)  // In case anything is after the id

      // Do album look up to get real cover imgId
      imgId = await getAlbum(imgId);
      console.log(imgId);

    } else if (regex.test(value)) {
      imgId = value.match(regex)[0];
      console.log(imgId);

    } else { return; }

    // Get imgId URL and update canvas
    try {
      getImg(imgId, setImgurImgData);
    } catch (error) {
      console.error(error);
    }

  }

  useEffect(() => {
    getImgBlob(imgurImgData.link, imgurImgData.id)
      .then(result => setImage(result))
      .catch((err) => console.error(err));
  }, [imgurImgData]); // eslint-disable-line react-hooks/exhaustive-deps

  function exportImgur() {
    console.log("Export");

    let newFilename = filename ? ("carmen-edited_" + filename) : "carmen-edited.jpg"
    let parent = editPaneRef.current;
    let canvas = parent.firstChild;

    // create link
    let img = {};
    img.name = newFilename;
    img.data = canvas.toDataURL("image/jpeg", 1);

    uploadImg(img);

  }

  function uploadConfirmation(result) {
    // Display a toast for either success (w/delete hash, ID, link, etc) or failure
  }

  return (
    <>
      <div id="editPane" ref={editPaneRef} className="edit-pane bg-gray container-lg text-center p-4 lh-1">
        <img id="canvas" alt="Editing Canvas" className="img-fluid" src={image} />
      </div>

      <div className="row my-3 d-flex align-items-end">
        <div className="col">
          <label htmlFor="formImgur" className="form-label">Import Image from or Upload to Imgur</label>
          <input className="form-control" id="formImgur" ref={imgurUrlRef} type="text"
            placeholder="https://imgur.com/..." aria-labelledby="formImgur" required />
        </div>
        <div className="col col-auto text-center ps-0">
          <button id="downloadImage" className="btn btn-primary" type="submit" onClick={importImgur}>
            <i className="d-block d-md-none bi bi-cloud-download" />
            <span className="d-none d-md-block">Import from Imgur</span>
          </button>
        </div>
        <div className="col col-auto text-center ps-0">
          <button id="downloadImage" className="btn btn-primary" onClick={exportImgur}>
            <i className="d-block d-md-none bi bi-cloud-upload" />
            <span className="d-none d-md-block">Upload to Imgur</span>
          </button>
        </div>
      </div>

      <div className="row my-3 d-flex align-items-end">
        <div className="col">
          <label htmlFor="formFile" className="form-label">Upload Image from Device</label>
          <input className="form-control" type="file" id="formFile" accept="image/*"
            aria-labelledby="formFile" onChange={uploadFile} />
        </div>
        <div className="col col-auto text-center ps-0">
          <button id="downloadImage" className="btn btn-primary" onClick={downloadImage}>
            <i className="d-block d-md-none bi bi-download" />
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
