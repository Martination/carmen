import { useState, useEffect } from 'react';
import FilterListItem from './FilterListItem'
const caman = window.Caman;


const filtersFullRange = ["brightness", "contrast", "vibrance", "saturation", "exposure"]   // -100 to 100
const filtersHalfRange = ["hue", "sepia", "noise", "sharpen", "clip"]     // 0 to 100
const filtersSpecial = [{ "gamma": [0, 1, 10] }]    // [low, default, high]

// TO DO:
// channels {red: [-100,100], green: [-100,100], blue:[-100:100]}
// stackBlur [0, 20]?
// colorize [R,G,B, [0-100]] || ['#eee', [0-100]]
// curves [[R,G,B], [P0x,P1x], [P2], [P3], [P4]]
// fill [R,G,B] || ['#eee]
// Greyscale(), Invert()


const CamanCanvas = () => {

  // window.Caman.DEBUG = true

  let image = "142.jpg";
  let htmlCanvas = "#canvas-id"
  let canvas = caman(htmlCanvas, image, function () {
    this.render();
  });

  const [adjustmentList, setAdjustmentList] = useState({});

  /* Update the image after our adjustments change */
  useEffect(() => {
    console.log("Adjusting from adjustList");
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
      // console.log(this);
      console.log(adjustmentList)
      this.revert();

      for (const adjustment in adjustmentList) {
        // console.log(adjustment)
        if (this[adjustment]) this[adjustment](adjustmentList[adjustment]);
        else console.log(`${adjustment} is not a valid filter.`);
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

          <FilterListItem filter={"brightness"} adjustmentList={adjustmentList} onChange={updateFilters} />
          <FilterListItem filter={"contrast"} adjustmentList={adjustmentList} onChange={updateFilters} />
          <FilterListItem filter={"vibrance"} adjustmentList={adjustmentList} onChange={updateFilters} />

          <FilterListItem filter={"test"} adjustmentList={adjustmentList} onChange={updateFilters} />

          <FilterListItem filter={"brightness"} adjustmentList={adjustmentList} onChange={updateFilters} />
          <FilterListItem filter={"contrast"} adjustmentList={adjustmentList} onChange={updateFilters} />
          <FilterListItem filter={"vibrance"} adjustmentList={adjustmentList} onChange={updateFilters} />

        </div>
      </div>
    </>
  );
}

export default CamanCanvas;
