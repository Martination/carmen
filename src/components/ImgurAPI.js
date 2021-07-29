import https from 'follow-redirects/https';
// const fs = require('fs');

function httpsRequest(params, postData) {
  return new Promise(function (resolve, reject) {
    var req = https.request(params, function (res) {

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



export function getImg(imageId, setImgData) {

  const options = {
    'method': 'GET',
    'hostname': 'api.imgur.com',
    'path': `/3/image/${imageId}`,
    'headers': {
      'Authorization': `Client-ID ${process.env.REACT_APP_CLIENTID}`
    },
    'maxRedirects': 20
  };

  httpsRequest(options)
    .then((results) => (setImgData(results.data)))
    .catch((err) => console.error(err));
}

export function getAlbum(albumId) {

  const options = {
    'method': 'GET',
    'hostname': 'api.imgur.com',
    'path': `/3/album/${albumId}`,
    'headers': {
      'Authorization': `Client-ID ${process.env.REACT_APP_CLIENTID}`
    },
    'maxRedirects': 20
  };

  return httpsRequest(options)
    .then((results) => { return results.data.images[0].id; })
    .catch((err) => console.error(err));
}
