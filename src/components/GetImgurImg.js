import { useState, useEffect } from 'react';
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
      // This is not a "Second reject", just a different sort of failure
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

export async function getImgBlob(imageUrl) {
  let response = await fetch(imageUrl);
  let data = await response.blob();

  return data;
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
    .then((results) => {
      console.log(results);
      setImgData(results.data);
    })
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
    .then((results) => {
      console.log(results);
      console.log(results.data.images[0].link)
      return results.data.images[0].id;
    })
    .catch((err) => console.error(err));
}

const GetImgurImg = () => {

  const [imgData, setImgData] = useState({});

  function downloadImage() {

    let imageId = "Bz2WPZT";   // jpg
    // let imageId = "CVYlM4R";   // album

    // getImg(imageId, setImgData);

    setImgData({ link: "https://i.imgur.com/Bz2WPZT.jpg", id: "Bz2WPZT", description: "This is an 1x1" });
  }

  // Used to only call it once, not repeatedly
  useEffect(() => {
    downloadImage();
  }, []);

  return (
    <div className="col">
      This is the Imgur Downloader. ID: {imgData.id} Desc: {imgData.description}
      <img alt={imgData.title} src={imgData.link}></img>
    </div>
  );
};

export default GetImgurImg;
