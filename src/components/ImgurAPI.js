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
      // req.ContentType = 'multipart/form-data';
      // req.AddParam('image', 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7')
      // req.AddParam('name', 'A very small image')
      // req.setHeader('content-type', 'multipart/form-data;');
      // req.setHeader('content-type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');
      req.write(postData);
    }

    req.end();
  });
}

// postData = {
//   'image': 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
//   'name': 'A very small image'
// }

export async function getImgBlob(imageUrl, imgId) {
  if (imageUrl) {
    let response = await fetch(imageUrl);
    let data = await response.blob();
    data.name = imgId;

    return data;
  }
}


// https://imgur.com/h961kWg

export function getImg(imageId, setImgData) {

  // const options = {
  //   'method': 'GET',
  //   'hostname': 'api.imgur.com',
  //   'path': `/3/image/${imageId}`,
  //   'headers': {
  //     'Authorization': `Client-ID ${process.env.REACT_APP_CLIENTID}`
  //   },
  //   'maxRedirects': 20
  // };



  let url = `https://api.imgur.com/3/image/${imageId}`;

  const options = {
    'method': 'GET',
    // 'url': url,
    // 'hostname': 'api.imgur.com',
    // 'path': `/3/image/${imageId}`,
    'headers': {
      'Authorization': `Client-ID ${process.env.REACT_APP_CLIENTID}`,
    },
    'maxRedirects': 20,
    // 'mode': 'cors',
    // "Access-Control-Allow-Origin": "*",
    // "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    // 'credentials': 'include',
    // 'crossDomain': true,
    // 'body': form
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

/*
R0lGODdhAQABAPAAAP8AAAAAACwAAAAAAQABAAACAkQBADs
*/

export function uploadImg(img) {
  img.data = img.data.toString().replace(/data:.+?,/, "")
  // console.log(img.data);

  // req.setHeader('content-type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');


  let postData = {
    'image': img.data,
    'type': 'base64'//,   // Can be [file, base64, URL]
    // 'name': img.name,
    // 'album': albumId
  };

  // postData = `
  // ------WebKitFormBoundary7MA4YWxkTrZu0gW
  // Content-Disposition: form-data; name="image"

  // R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7
  // ------WebKitFormBoundary7MA4YWxkTrZu0gW--`;


  postData = `
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="name"

A small image
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="image"

R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7
------WebKitFormBoundary7MA4YWxkTrZu0gW--`;

  // postData = {
  //   'image': 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  //   'name': 'A very small image'
  // }

  let url = 'https://api.imgur.com/3/image';
  const form = new FormData();
  form.append('name', 'An image');
  form.append('image', 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');

  // console.log(form.getHeaders());
  // form.submit(url, function (err, res) {
  //   console.log(res);
  // })

  // console.log("form", postData);
  // console.log("form", form);
  // console.log("form", form.entries());

  // form.entries().forEach((i) => console.log(i));

  for (let [key, value] of form.entries()) {
    console.log(key, value);
  }


  url = 'https://api.imgur.com/3/image';

  const options = {
    'method': 'POST',
    // 'hostname': 'api.imgur.com',
    // 'path': '/3/image',
    // 'url': url,
    'headers': {
      'Authorization': `Client-ID ${process.env.REACT_APP_CLIENTID}`,
      // 'Content-Type': 'multipart/form-data'
    },
    'maxRedirects': 20,
    // 'mode': 'cors',
    // "Access-Control-Allow-Origin": "*",
    // "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    // 'credentials': 'include',
    // 'crossDomain': true,
    'body': form
  };

  fetch(url, options)
    .then((res) => res.json())
    .then((data) => { console.log(data.data); })
    .catch((err) => console.error(err));

  // fetch(url, {
  //   method: 'POST',
  //   url: url,
  //   body: form,
  //   headers: {
  //     'Authorization': `Client-ID ${process.env.REACT_APP_CLIENTID}`,
  //     'Content-Type': 'multipart/form-data',
  //     // 'Access-Control-Allow-Origin': '*'
  //   },
  // })
  //   .then(function (response) {
  //     //handle success
  //     console.log(response);
  //   })
  //   .catch(function (response) {
  //     //handle error
  //     console.log(response);
  //   });


  // console.log(options);

  // const options = {
  //   'method': 'POST',
  //   'hostname': 'api.imgur.com',
  //   'path': '/3/image',
  //   'headers': {
  //     'Authorization': `Client-ID ${process.env.REACT_APP_CLIENTID}`,
  //     'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
  //   },
  //   'maxRedirects': 20
  // };

  //   postData = `
  // Content-Disposition: form-data; name="image"

  // R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7`;

  // console.log(JSON.stringify(postData))

  // httpsRequest(options, form)
  //   .then((results) => (console.log(results.data)))
  //   .catch((err) => console.error(err));
}
