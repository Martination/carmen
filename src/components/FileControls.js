import { useEffect, useState } from 'react';

import { NotificationToast } from './Bootstrap';
// import { Button, Toast } from 'bootstrap';

// let toast = { toast: toastDisplay, setToast: setToast, toastInfo: toastInfo };
// let imgur = { imgurUrlRef: imgurUrlRef, deleteImage: deleteImage, importImgur: importImgur, exportImgur: exportImgur };
// let file = { setImage: setImage, uploadFile: uploadFile, downloadImage: downloadImage };

function FileControls({ toast, imgur, canvasControls, editPaneRef }) {
  const [filename, setFilename] = useState('');

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
        toast.setToastInfo({ 'success': false, 'text': `Unsupported Filetype: ${imageType}` });
        toast.setToast(true);
        return;
      }

      const img = new Image();
      img.src = reader.result;

      img.onload = () => { canvasControls.updateCanvas(img); };
      toast.setToastInfo({ 'success': true, 'text': '' });
      toast.setToast(false);
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


  return (
    <>
      <NotificationToast toast={toast.toast} setToast={toast.setToast}
        status={toast.toastInfo.success} toastText={toast.toastInfo.text} />

      <div className="row my-2 d-flex align-items-end">
        <div className="col">
          <label htmlFor="formImgur" className="form-label">Import Image from or Upload to Imgur</label>
          <div className="btn-group" style={{ width: '100%' }}>

            <input id="formImgur" ref={imgur.imgurUrlRef} type="text" placeholder="https://imgur.com/..."
              className="form-control btn bg-light border-light text-start user-select-auto pe-0"
              style={{ cursor: 'text' }} aria-labelledby="formImgur" />

            <button type="button" data-bs-toggle="dropdown" aria-expanded="false"
              className="btn btn-light dropdown-toggle dropdown-toggle-split">
              <span className="visually-hidden">Dropdown Menu</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark">
              <li><button className="dropdown-item" onClick={imgur.deleteImage}>
                Delete previously uploaded image
              </button></li>
            </ul>
          </div>
        </div>

        <div className="col col-auto text-center ps-0">
          <button id="downloadImage" className="btn btn-primary" type="submit" onClick={imgur.importImgur}>
            <i className="d-block d-md-none bi bi-cloud-download" />
            <span className="d-none d-md-block">Import from Imgur</span>
          </button>
        </div>
        <div className="col col-auto text-center ps-0">
          <button id="downloadImage" className="btn btn-primary" onClick={imgur.exportImgur}>
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
