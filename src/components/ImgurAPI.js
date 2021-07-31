// import https from 'follow-redirects/https';
// const fs = require('fs');

export async function getImgBlob(imageUrl, imgId) {
  if (imageUrl) {
    let response = await fetch(imageUrl);
    let data = await response.blob();
    data.name = imgId;

    return data;
  }
}

// https://imgur.com/h961kWg
// https://imgur.com/a/3AMDPNA

export function getImg(imageId, setImgData) {

  let url = `https://api.imgur.com/3/image/${imageId}`;

  const options = {
    'method': 'GET',
    'headers': {
      'Authorization': `Client-ID ${process.env.REACT_APP_CLIENTID}`,
    },
    'maxRedirects': 20,
  };

  return fetch(url, options)
    .then((res) => res.json())
    .then((data) => {
      const mime = /image/

      if (!mime.test(data.data.type)) {
        throw new Error(`Unsupported Filetype: ${data.data.type}`);
      }

      setImgData(data.data);
    });
}

export function getAlbum(albumId) {

  let url = `https://api.imgur.com/3/album/${albumId}`;

  const options = {
    'method': 'GET',
    'headers': {
      'Authorization': `Client-ID ${process.env.REACT_APP_CLIENTID}`,
    },
    'maxRedirects': 20,
  };

  return fetch(url, options)
    .then((res) => res.json())
    .then((data) => { return data.data.images[0].id; })
    .catch((err) => console.error(err));
}


export function uploadImg(img, callback) {

  img.data = img.data.toString().replace(/data:.+?,/, "")
  let formData = {
    'name': img.name,
    'image': img.data,
    'type': 'base64'
  };

  const form = new FormData();
  // form.append('name', 'An image');
  // form.append('image', 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');

  for (let [key, value] of Object.entries(formData)) {
    form.append(key, value);
  }

  const url = 'https://api.imgur.com/3/image';
  const options = {
    'method': 'POST',
    'headers': {
      'Authorization': `Client-ID ${process.env.REACT_APP_CLIENTID}`,
    },
    'maxRedirects': 20,
    'body': form
  };

  fetch(url, options)
    .then((res) => res.json())
    .then((data) => callback(data.data))
    .catch((err) => console.error(err));
}
