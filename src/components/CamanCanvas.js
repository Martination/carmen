import { useState, useEffect } from 'react';
import FilterListItem from './FilterListItem'
const caman = window.Caman;

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


// window.Caman.DEBUG = true

let image = "142.jpg";
let htmlCanvas = "#canvas-id"
// let canvas =
caman(htmlCanvas, image, function () {
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
      <div className="edit-pane container p-4">
        <p><img alt="before" id="img-id" src={image}></img> Before</p>
        <p><img alt="after" id="canvas-id" src={image}></img> After</p>
      </div>

      <div id="filterList" className="container text-center">
        <div className="row row-cols-1 row-cols-md-2 center">

          {createFilterList(adjustmentList, updateFilters)}

        </div>
      </div>
    </>
  );
}

export default CamanCanvas;
