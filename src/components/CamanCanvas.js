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

const CamanCanvas = () => {

  // window.Caman.DEBUG = true

  let image = "142.jpg";
  let htmlCanvas = "#canvas-id"
  let canvas = caman(htmlCanvas, image, function () {
    this.render();
  });


  function createFilterList(adjustmentList, onChange) {
    // -100 to 100
    const filtersFullRange = ["brightness", "contrast", "vibrance", "saturation", "exposure"];
    // 0 to 100
    const filtersHalfRange = ["hue", "sepia", "noise", "sharpen", "clip"];
    const filtersSpecial = { "gamma": { "min": 0, "default": 1, "max": 10, "step": 0.1 } };

    const presets = [
      "vintage", "lomo", "clarity", "sinCity", "sunrise", "crossProcess", "orangePeel",
      "love", "grungy", "jarques", "pinhole", "oldBoot", "glowingSun",
      "hazyDays", "herMajesty", "nostalgia", "hemingway", "concentrate"
    ];

    let rangeList = {}

    const rangeFull = { "min": -100, "default": 0, "max": 100 }
    // Must be for...of; for...in replaces names with indicies
    for (const filter of filtersFullRange) { rangeList[filter] = rangeFull; }

    // const rangeHalf = { "min": 0, "default": 0, "max": 100 }
    // for (filter of filtersHalfRange) { rangeList[filter] = rangeHalf; }
    // rangeList = { ...rangeList, ...filtersSpecial };
    // console.log(rangeList);

    const filters = [];
    // Must be for...in, rangeList isn't iterable
    for (const filter in rangeList) {
      // console.log(filter, rangeList[filter])
      filters.push(
        <FilterListItem key={filter} filter={filter} adjustmentList={adjustmentList} onChange={onChange} />
      )
    }

    return filters;
  }

  const [adjustmentList, setAdjustmentList] = useState({});

  /* Update the image after our adjustments change */
  useEffect(() => {
    updateImage(adjustmentList);
  }, [adjustmentList]);

  /* Sliders Callback */
  const updateFilters = (event) => {
    // console.log(event);

    const filter = event.target.id;
    console.log("Updating", filter);

    const value = parseInt(event.target.value);
    const newList = { ...adjustmentList, [filter]: value };
    setAdjustmentList(newList);
  }

  function updateImage(adjustmentList) {

    caman(htmlCanvas, function () {
      console.log("~~~~ UPDATE IMAGE ~~~~")
      console.log(adjustmentList)

      this.revert(false);
      for (const adjustment in adjustmentList) {
        if (this[adjustment]) this[adjustment](adjustmentList[adjustment]);
        else console.log(`${adjustment} is not a valid filter.`);   // Maybe delete invalid filter?
        // this[adjustment.filter](adjustment.value);
        // console.log(`${filter}: ${adjustmentList[filter]}`);
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

          {/* <FilterListItem filter={"brightness"} adjustmentList={adjustmentList} onChange={updateFilters} />
          <FilterListItem filter={"contrast"} adjustmentList={adjustmentList} onChange={updateFilters} />
          <FilterListItem filter={"vibrance"} adjustmentList={adjustmentList} onChange={updateFilters} />

          <FilterListItem filter={"test"} adjustmentList={adjustmentList} onChange={updateFilters} />

          <FilterListItem filter={"saturation"} adjustmentList={adjustmentList} onChange={updateFilters} />
          <FilterListItem filter={"exposure"} adjustmentList={adjustmentList} onChange={updateFilters} /> */}

          {createFilterList(adjustmentList, updateFilters)}

        </div>
      </div>
    </>
  );
}

export default CamanCanvas;
