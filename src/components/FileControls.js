import { useEffect, useState, useRef } from 'react';

import { getImg, getImgBlob, getAlbum, uploadImg, deleteImgur } from './ImgurAPI';
import { NotificationToast } from './Bootstrap';
// import { Button, Toast } from 'bootstrap';

// let toast = { toastDisplay: toastDisplay, setToast: setToast, toastInfo: toastInfo, setToastInfo: setToastInfo };
// let imgur = { imgurUrlRef: imgurUrlRef, deleteImage: deleteImage, importImgur: importImgur, exportImgur: exportImgur };
// let canvasControls = { updateCanvas: updateCanvas };

function FileControls({ canvasControls, editPaneRef }) {
  const [filename, setFilename] = useState('');
  const [imgurImgData, setImgurImgData] = useState({});
  const [toastDisplay, setToast] = useState(false);
  const [toastInfo, setToastInfo] = useState({ 'success': true, 'text': '' });
  const imgurUrlRef = useRef(null);

  // let toastDisplay, setToast, toastInfo, setToastInfo;
  // ({ toastDisplay, setToast, toastInfo, setToastInfo } = toast);

  // let deleteImage;
  // ({ deleteImage } = imgur);

  /*
   * Direct image/file changes
   */

  /* Read a file  */
  function setImage(file) {
    const reader = new FileReader();
    if (file) {
      setFilename(file.name);
      // read data as URL
      reader.readAsDataURL(file);
    }

    reader.onload = () => {
      const mime = /image/;
      const base64 = /data:.+?;/;
      const imageType = reader.result.match(base64)[0];
      const imageMime = mime.test(imageType);  // Test if base64 header says "image"

      if (!imageMime) {
        setToastInfo({ 'success': false, 'text': `Unsupported Filetype: ${imageType}` });
        setToast(true);
        return;
      }

      const img = new Image();
      img.src = reader.result;

      img.onload = () => { canvasControls.updateCanvas(img); };
      setToastInfo({ 'success': true, 'text': '' });
      setToast(false);
    };
  }

  /* Take the file from the file browser and set it */
  function uploadFile(event) {
    const uploadedFile = event.target.files[0];
    setImage(uploadedFile);
  }

  function downloadImage() {

    const newFilename = filename ? ('carmen-edited_' + filename) : 'carmen-edited.jpg';
    console.log('Downloading', newFilename);

    const parent = editPaneRef.current;
    const canvas = parent.firstChild;

    // create link
    const link = document.createElement('a');
    link.download = newFilename;
    link.href = canvas.toDataURL('image/jpeg', 1);
    link.dispatchEvent(new MouseEvent('click'));
  }



  /*
   *  ImgurAPI.js calls
   */
  /* Import image from form textbox */
  async function importImgur() {
    const form = imgurUrlRef.current;
    const value = form.value;

    if (!value) {
      setToastInfo({ 'success': false, 'text': 'Must provide an Imgur URL.' });
      setToast(true);
      return;
    }

    // imageID is 7 chars long
    const regex = /\w{7}/g;
    const album = /\/gallery\/|\/a\//g;

    let imgId;
    if (album.test(value)) {
      imgId = value.split(album)[1];
      imgId = imgId.substring(0, 7);  // In case anything is after the id

      // Do album look up to get real cover imgId
      imgId = await getAlbum(imgId);
      console.log(imgId);

    } else if (regex.test(value)) {
      imgId = value.match(regex)[0];
      console.log(imgId);

    } else {
      const message = 'No Imgur Image ID found. Please use the direct URL to the image.';
      setToastInfo({ 'success': false, 'text': message });
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
      .then((result) => setImage(result))
      .catch((err) => console.error(err));
  }, [imgurImgData]); // eslint-disable-line react-hooks/exhaustive-deps

  function exportImgur() {
    const newFilename = filename ? ('carmen-edited_' + filename) : 'carmen-edited.jpg';
    const parent = editPaneRef.current;
    const canvas = parent.firstChild;

    let img = {};
    img.name = newFilename;
    img.data = canvas.toDataURL('image/jpeg', 1);

    const div =
      <div className="d-flex align-items-center"> Uploading...
        <div className="spinner-border ms-auto" role="status" aria-hidden="true"></div>
      </div>;
    setToastInfo({ 'success': true, 'text': div });
    setToast(true);

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
      setToastInfo({ 'success': false, 'text': `Error: ${result?.error || 'Unknown Error'}` });
      setToast(true);
      return;
    }

    const link = result.link || '';
    const deletehash = result.deletehash || '';

    const header = /http(s)?:\/\/(www.)?/g;
    const displayLink = link.replace(header, '');

    const a = <a href={link} target="_blank" rel="noreferrer">{displayLink}</a>;
    const div = <div>Image uploaded to {a}. The code to delete it is <samp>{deletehash}</samp>.</div>;
    setToastInfo({ 'success': true, 'text': div });
    setToast(true);
  }

  /* Delete an Image from Imgur using the deletehash */
  function deleteImage() {

    const form = imgurUrlRef.current;
    const value = form.value;

    // deleteHash is 15 chars long
    const hash = /\w{15}/;

    const deletehash = value.match(hash);
    if (!deletehash) {
      const error = 'No delete code found. Paste the 15 character delete code into the text box.';
      setToastInfo({ 'success': false, 'text': error });
      setToast(true);
      return;
    }

    deleteImgur(deletehash, deleteConfirmation)
      .catch((err) => {
        console.log(err.message);
        setToastInfo({ 'success': false, 'text': err.message });
        setToast(true);
      });
  }

  function deleteConfirmation(result) {
    console.log(result);

    if (!result || !result.success || result.error) {
      setToastInfo({ 'success': false, 'text': `Error: ${result?.error || 'Unknown Error'}` });
      setToast(true);
      return;
    }

    setToastInfo({ 'success': true, 'text': 'Image successfully deleted.' });
    setToast(true);
  }


  return (
    <>
      <NotificationToast toast={toastDisplay} setToast={setToast}
        status={toastInfo.success} toastText={toastInfo.text} />

      <div className="row my-2 d-flex align-items-end">
        <div className="col">
          <label htmlFor="formImgur" className="form-label">Import Image from or Upload to Imgur</label>
          <div className="btn-group" style={{ width: '100%' }}>

            <input id="formImgur" ref={imgurUrlRef} type="text" placeholder="https://imgur.com/..."
              className="form-control btn bg-light border-light text-start user-select-auto pe-0"
              style={{ cursor: 'text' }} aria-labelledby="formImgur" />

            <button type="button" data-bs-toggle="dropdown" aria-expanded="false"
              className="btn btn-light dropdown-toggle dropdown-toggle-split">
              <span className="visually-hidden">Dropdown Menu</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark">
              <li><button className="dropdown-item" onClick={deleteImage}>
                Delete previously uploaded image
              </button></li>
            </ul>
          </div>
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
    </>
  );
}

export default FileControls;
