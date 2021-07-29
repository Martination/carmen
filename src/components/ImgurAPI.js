import https from 'follow-redirects/https';
// const fs = require('fs');

function httpsRequest(params, postData) {
  return new Promise(function (resolve, reject) {
    const req = https.request(params, function (res) {

      // reject on bad status
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error('Status Code ' + res.statusCode));
      }

      // cumulate data
      var body = [];
      res.on('data', function (chunk) {
        body.push(chunk);
      });

      // resolve on end
      res.on('end', function () {
        try {
          body = JSON.parse(Buffer.concat(body).toString());
        } catch (err) {
          reject(err);
        }
        resolve(body);
      });
    });

    // reject on request error
    req.on('error', function (err) {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

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

  fetch(url, options)
    .then((res) => res.json())
    .then((data) => { console.log(data); setImgData(data.data) })
    .catch((err) => console.error(err));


  // httpsRequest(options)
  //   .then((results) => (setImgData(results.data)))
  //   .catch((err) => console.error(err));
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


  // const options = {
  //   'method': 'GET',
  //   'hostname': 'api.imgur.com',
  //   'path': `/3/album/${albumId}`,
  //   'headers': {
  //     'Authorization': `Client-ID ${process.env.REACT_APP_CLIENTID}`
  //   },
  //   'maxRedirects': 20
  // };

  // return httpsRequest(options)
  //   .then((results) => { return results.data.images[0].id; })
  //   .catch((err) => console.error(err));
}


export function uploadImg(img, callback) {
  img.data = img.data.toString().replace(/data:.+?,/, "")

  let postData = {
    'name': img.name,
    'image': img.data,
    'type': 'base64'
  };

  const form = new FormData();
  // form.append('name', 'An image');
  // form.append('image', 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');

  for (let [key, value] of Object.entries(postData)) {
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
