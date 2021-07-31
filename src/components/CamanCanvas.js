import { useState, useEffect, useRef } from 'react';
import throttle from 'lodash/throttle';

import { getImg, getImgBlob, getAlbum, uploadImg } from './ImgurAPI'
import { CreatePresetList, CreateFilterList } from './CamanControls'
import { NotificationToast } from './Bootstrap'

// import image from './../WP.png'
import image from './../142.jpg'

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
  const [toastDisplay, setToast] = useState(false);
  const [toastInfo, setToastInfo] = useState({ 'success': true, 'text': '' });
  const editPaneRef = useRef(null);
  const imgurUrlRef = useRef(null);

  updateImgFn = updateImage;  // Save function so Caman Event listener can call it


  // Throttled could take an options object, but it appears to work fine with default
  const throttled = useRef(throttle((adjustmentList) => (updateImage(adjustmentList)), 100));

  /* Update the image after our adjustments change */
  useEffect(() => {
    // if (JSON.stringify(prevList) !== JSON.stringify(adjustmentList)) {
    if (JSON.stringify(prevRenderList) !== JSON.stringify(adjustmentList)) {

      if (!isRendering) {
        if (backlog) { isRendering = true; }
        throttled.current(adjustmentList);
        backlog += 1;
      }
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
    console.log("Downloading", newFilename);

    let parent = editPaneRef.current;
    let canvas = parent.firstChild;

    // create link
    const link = document.createElement("a");
    link.download = newFilename;
    link.href = canvas.toDataURL("image/jpeg", 1);
    let e = new MouseEvent("click");
    link.dispatchEvent(e);
  }


  /* Imgur Functions */
  async function importImgur() {
    let form = imgurUrlRef.current;
    let value = form.value;

    if (!value) {
      setToastInfo({ 'success': false, 'text': "Must provide an Imgur URL" })
      setToast(true);
      return;
    }

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

    } else {
      setToastInfo({ 'success': false, 'text': "No Imgur Image ID found. Please use the direct URL to the image." });
      setToast(true);
      return;
    }

    // Get imgId URL and update canvas
    getImg(imgId, setImgurImgData)
      .then(() => {
        setToastInfo({ 'success': true, 'text': '' });
        setToast(false);
      })
      .catch((err) => {
        console.log(err.message);
        setToastInfo({ 'success': false, 'text': err.message });
        setToast(true);
      });
  }

  useEffect(() => {
    getImgBlob(imgurImgData.link, imgurImgData.id)
      .then(result => setImage(result))
      .catch((err) => console.error(err));
  }, [imgurImgData]); // eslint-disable-line react-hooks/exhaustive-deps

  function exportImgur() {
    let newFilename = filename ? ("carmen-edited_" + filename) : "carmen-edited.jpg"
    let parent = editPaneRef.current;
    let canvas = parent.firstChild;

    let img = {};
    img.name = newFilename;
    img.data = canvas.toDataURL("image/jpeg", 1);

    try {
      uploadImg(img, uploadConfirmation);
    } catch (err) {
      console.log(err);
      setToastInfo({ 'success': false, 'text': err.message });
      setToast(true);
    }
  }

  /* Display a toast for either success or failure */
  function uploadConfirmation(result) {
    console.log(result);

    if (!result || result.error) {
      setToastInfo({ 'success': false, 'text': `Error: ${result?.error || "Unknown Error"}` });
      setToast(true);
      return;
    }

    let link = result.link || '';
    let deletehash = result.deletehash || '';

    let header = /http(s)?:\/\/(www.)?/g
    let displayLink = link.replace(header, "");

    let a = <a href={link} target="_blank" rel="noreferrer">{displayLink}</a>
    let div = <div>Image uploaded to {a}. The code to delete it is <samp>{deletehash}</samp>.</div>;
    setToastInfo({ 'success': true, 'text': div });
    setToast(true);
  }


  return (
    <>
      <div id="editPane" ref={editPaneRef} className="edit-pane bg-gray container-lg text-center p-4 lh-1">
        <img id="canvas" alt="Editing Canvas" className="img-fluid" aria-label="Editing Canvas" src={image} />
      </div>

      <NotificationToast toast={toastDisplay} setToast={setToast}
        status={toastInfo.success} toastText={toastInfo.text} />

      <div className="row my-2 d-flex align-items-end">
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

      <div className="row my-2 d-flex align-items-end">
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
