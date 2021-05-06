import { useState, useEffect } from 'react';
import FilterListItem from './FilterListItem'
const caman = window.Caman;


const CamanCanvas = () => {

  let image = "142.jpg";
  let htmlCanvas = "#canvas-id"
  let canvas = caman(htmlCanvas, image, function () {
    this.render();
  });

  /*
    const [brightness, setBrightness] = useState(0);
    const onChange = (event) => {
      setBrightness(event.target.value);
      // updateImage({ 'brightness': event.target.value });
      // console.log(event.target.attributes);
    }
    */

  const [adjustmentList, setAdjustmentList] = useState({});
  // const [adjustmentList, setAdjustmentList] = useState([]);

  /* Update the image after our adjustments change */
  useEffect(() => {
    console.log("Adjusting from adjustList");
    updateImage(adjustmentList);
    // return () => {
    // cleanup: revert changes??
    // setAdjustmentList([]);
    // console.log("Cleanup called")
    // };
  }, [adjustmentList]);

  /* Sliders Callback */
  const updateFilters = (event) => {
    // console.log(event);

    const filter = event.target.id;
    console.log("Updating", filter);

    const value = parseInt(event.target.value);
    const newList = { ...adjustmentList, [filter]: value };
    // const newList = adjustmentList[{ filter: value }];
    // const newList = adjustmentList.concat({ filter: filter, value: value });
    setAdjustmentList(newList);
  }

  // useEffect(() => {
  //   console.log("Adjusting from brightness");
  //   // updateImage([{ 'filter': 'brightness', 'value': brightness }]);
  //   console.log("Brightness update");
  //   // console.log(event.target.attributes);
  //   // return () => {
  //   //   cleanup
  //   // }
  // }, [brightness])

  // Caman.DEBUG = true

  /*
    const brightnessUpdate = (event) => {
      console.log(event.target);
      console.log(event.target.attributes['data-filter'].value);
      setBrightness(event.target.value);
      updateImage({ 'brightness': event.target.value });
    };
    const writeBrightness = (event) => {
      console.log(brightness);
      updateImage({ 'brightness': brightness });
    }
  */

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

  function resetSliders() {
    let sliders = document.getElementsByTagName('input')

    for (const slider of sliders) {
      slider.nextElementSibling.innerHTML = slider.value;
      updateInputFn(slider);
    }
  }

  // resetSliders();


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

          {/*
          <div className="col">
            <div className="row gx-1">
              <label htmlFor="brightness" className="col-3">brightness</label>
              <div className="col-8">
                <input id="brightness" className="form-range slider"
                  type="range" min="-100" max="100" step="1"
                  value={adjustmentList["brightness"] || -100} onChange={updateFilters} />
              </div>
              <span className="col-1">{adjustmentList["brightness"] || -100}</span>
            </div>
          </div>

          <form className="col">
            <div className="row">
              <label htmlFor="contrast" className="col-3">contrast</label>
              <div className="col-8">
                <input id="contrast" className="form-range slider"
                  type="range" min="-100" max="100" step="1"
                  value={adjustmentList["contrast"] || 0} onChange={updateFilters} />
              </div>
              <span className="col-1">{adjustmentList["contrast"] || 0}</span>
            </div>
          </form>

          <form className="col">
            <div className="row">
              <label htmlFor="vibrance" className="col-3">vibrance</label>
              <div className="col-8">
                <input id="vibrance" className="form-range slider"
                  type="range" min="-100" max="100" step="1"
                  value={adjustmentList["vibrance"] || 0} onChange={updateFilters} />
              </div>
              <span className="col-1">{adjustmentList["vibrance"] || 0}</span>
            </div>
          </form>
          */}
        </div>

        {/* <form className="col-auto">
            <label for="contrast" className="form-label col-auto">contrast</label>
            <div className="col-4">
              <input id="contrast" className="form-range slider"
                type="range" min="-100" max="100" step="1"
                value={adjustmentList["contrast"] || 0} onChange={updateFilters} />
            </div>
            <span className="value col-auto">{adjustmentList["contrast"] || 0}</span>
          </form> */}


        {/* <form className="row g-4">
          <label for="brightness" className="form-label col-auto">brightness</label>
          <div className="col-4">
            <input id="brightness" className="form-range slider"
              type="range" min="-100" max="100" step="1"
              value={adjustmentList["brightness"] || 0} onChange={updateFilters} />
          </div>
          <span className="value col-auto">{adjustmentList["brightness"] || 0}</span>
        </form> */}
      </div>


      {/*
      <div className="container">
        <div className="row">
          <div className="col-sm-3">
            Level 1: .col-sm-3
          </div>
          <div className="col-sm-9">
            <div className="row">
              <div className="col-8 col-sm-6">
                Level 2: .col-8 .col-sm-6
              </div>
              <div className="col-4 col-sm-6">
                Level 2: .col-4 .col-sm-6
              </div>
            </div>
            <div className="row">
              <div className="col-8 col-sm-6">
                Level 2: .col-8 .col-sm-6
              </div>
              <div className="col-4 col-sm-6">
                Level 2: .col-4 .col-sm-6
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-sm-8">col-sm-8</div>
          <div className="col-sm-4">col-sm-4</div>
        </div>
        <div className="row">
          <div className="col-sm">col-sm</div>
          <div className="col-sm">col-sm</div>
          <div className="col-sm">col-sm</div>
        </div>
      </div>

      <div>
        <form className="row g-3">
          <div className="col-md-6">
            <label for="inputEmail4" className="form-label">Email</label>
            <input type="email" className="form-control" id="inputEmail4" />
          </div>
          <div className="col-md-6">
            <label for="inputPassword4" className="form-label">Password</label>
            <input type="password" className="form-control" id="inputPassword4" />
          </div>
          <div className="col-12">
            <label for="inputAddress" className="form-label">Address</label>
            <input type="text" className="form-control" id="inputAddress" placeholder="1234 Main St" />
          </div>
          <div className="col-12">
            <label for="inputAddress2" className="form-label">Address 2</label>
            <input type="text" className="form-control" id="inputAddress2" placeholder="Apartment, studio, or floor" />
          </div>
          <div className="col-md-6">
            <label for="inputCity" className="form-label">City</label>
            <input type="text" className="form-control" id="inputCity" />
          </div>
          <div className="col-md-4">
            <label for="inputState" className="form-label">State</label>
            <select id="inputState" className="form-select">
              <option selected>Choose...</option>
              <option>...</option>
            </select>
          </div>
          <div className="col-md-2">
            <label for="inputZip" className="form-label">Zip</label>
            <input type="text" className="form-control" id="inputZip" />
          </div>
          <div className="col-12">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="gridCheck" />
              <label className="form-check-label" for="gridCheck">
                Check me out
              </label>
            </div>
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-primary">Sign in</button>
          </div>
        </form>
      </div> */}


    </>
  );
}

export default CamanCanvas;
