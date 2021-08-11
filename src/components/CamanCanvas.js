import { useState, useEffect, useRef } from 'react';
import throttle from 'lodash/throttle';

import { CreatePresetList, CreateFilterList } from './CamanControls';
import FileControls from './FileControls';

import image from './../WP.png';
// import image from './../142.jpg';

const caman = window.Caman;


// TO DO:
// channels {red: [-100,100], green: [-100,100], blue:[-100:100]}
// stackBlur [0, 20]?
// colorize [R,G,B, [0-100]] || ['#eee', [0-100]]
// curves [[R,G,B], [P0x,P1x], [P2], [P3], [P4]]
// fillColor [R,G,B] || ['#eee']

// Stage 2
// Crop, Resize, Preset strength, undo/redo
// vignette, rectangularVignette, tiltShift, radialBlur,
// boxBlur?, heavyRadialBlur, gaussianBlur, motionBlur,
// edgeEnhance, edgeDetect, emboss, posterize,


let isRendering = false;
let prevRenderList = {}, curRenderList = {};
let backlog = 0;
let updateImgFn = () => { };
const throttledEventListen = throttle((curRenderList) => (updateImgFn(curRenderList)), 1000);

caman.Event.listen('processStart', (job) => {
  // console.log('Start:', job.name);
  isRendering = true;
});

caman.Event.listen('processComplete', (job) => {
  // console.log('Finish:', job.name);
  isRendering = false;
  backlog = 0;
  if (JSON.stringify(prevRenderList) !== JSON.stringify(curRenderList)) {
    throttledEventListen(curRenderList);
  }
});


// window.Caman.DEBUG = true
const htmlCanvas = '#canvas';
caman(htmlCanvas, function () {
  this.render();
});

const CamanCanvas = () => {
  const [presetList, setPresetList] = useState('');
  const [filterList, setFilterList] = useState({});
  const [presetToggle, setPresetToggle] = useState(false);
  const editPaneRef = useRef(null);

  updateImgFn = updateImage;  // Save function so Caman Event listener can call it


  // Throttled could take an options object, but it appears to work fine with default
  const throttled = useRef(throttle((curRenderList) => (updateImage(curRenderList)), 100));

  /* Combine presets and filters into master adjustment list and update the image */
  useEffect(() => {

    // Check for invalid presets
    let preset = presetList;
    if (presetList && !caman.prototype[presetList]) {
      console.log(`${presetList} is not a valid preset.`);
      setPresetList(preset = '');
    }

    // Check for invalid filters
    let filters = { ...filterList };
    for (const filter in filterList) {
      if (!caman.prototype[filter]) {
        console.log(`${filter} is not a valid filter.`);
        delete filters[filter];
        setFilterList(filters);
      }
    }

    // Combine the two lists
    let newList;
    if (preset) { newList = { [preset]: 1 }; }
    if (filterList !== {}) { newList = { ...newList, ...filters }; }
    curRenderList = newList;

    // If it's not identical, re-render Caman
    if (JSON.stringify(prevRenderList) !== JSON.stringify(newList)) {
      if (!isRendering) {
        if (backlog) { isRendering = true; }
        throttled.current(newList);   // Throttled calls updateImage()
        backlog += 1;
      }
    }
  }, [filterList, presetList]);


  /* Sliders Callback */
  function updateFilters(event, init) {
    const filter = event.target.name;
    const value = parseFloat(event.target.value);
    console.log('Updating', filter);

    let newList;
    if (value === init) {
      // console.log(`Reset ${filter} to default`)
      newList = { ...filterList };
      delete newList[filter];
    } else {
      newList = { ...filterList, [filter]: value };
    }

    setFilterList(newList);
  }

  /* Button Callback */
  function updatePresets(event) {
    const preset = event.target.id;
    // function to guarantee using the latest presetList
    setPresetList((presetList) => presetList === preset ? '' : preset);
  }


  function updateImage(adjustmentList) {
    prevRenderList = adjustmentList;
    caman(htmlCanvas, function () {
      console.log('~~~~ UPDATE IMAGE ~~~~');
      console.log(adjustmentList);

      this.revert(false);
      for (const filter in adjustmentList) {

        if (this[filter]) {
          this[filter](adjustmentList[filter]);
        } else {
          console.log(`~${filter}~ is not a valid filter.`);
        }
      }
      this.render();
    });
  }


  /* Take an image object and update the canvas */
  function updateCanvas(img) {
    const parent = editPaneRef.current;
    const canvas = parent.firstChild;
    const context = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0, img.width, img.height);
    canvas.removeAttribute('data-caman-id');

    updateImage(curRenderList);
  }


  return (
    <>
      <div id="editPane" ref={editPaneRef} className="edit-pane bg-gray container-lg text-center p-4 lh-1">
        <img id="canvas" alt="Editing Canvas" className="img-fluid" aria-label="Editing Canvas" src={image} />
      </div>

      <FileControls updateCanvas={updateCanvas} editPaneRef={editPaneRef} />

      <div id="filterHolder">
        <div id="filterList" className="container overflow-hidden bg-dark text-center my-3 p-2">

          <div className="row row-cols-1 row-cols-md-2 center">
            <CreateFilterList filterList={filterList} onChange={updateFilters} />
          </div>

          <hr />
          <div className="py-2">
            <button className="btn btn-primary" onClick={() => setPresetToggle(!presetToggle)}
              data-bs-target="#collapseTarget" data-bs-toggle="collapse">
              <i className={"px-2 bi " + (presetToggle ? "bi-chevron-compact-up" : "bi-chevron-compact-down")} />
              Presets
              <i className={"px-2 bi " + (presetToggle ? "bi-chevron-compact-up" : "bi-chevron-compact-down")} />
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
