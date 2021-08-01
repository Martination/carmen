export async function getImgBlob(imageUrl, imgId) {
  if (imageUrl) {
    let response = await fetch(imageUrl);
    let data = await response.blob();
    data.name = imgId;

    return data;
  }
}

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
    .then((res) => {
      if (!res.ok || res.status < 200 || res.stauts >= 300) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
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

  img.data = img.data.toString().replace(/data:.+?,/, "");
  let formData = {
    'name': img.name,
    'image': img.data,
    'type': 'base64',
  };

  const form = new FormData();
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
    'body': form,
  };

  return fetch(url, options)
    .then((res) => res.json())
    .then((data) => callback(data.data));
}

export function deleteImgur(deletehash, callback) {

  let url = `https://api.imgur.com/3/image/${deletehash}`;

  const options = {
    'method': 'DELETE',
    'headers': {
      'Authorization': `Client-ID ${process.env.REACT_APP_CLIENTID}`,
    },
    'maxRedirects': 20,
  };

  return fetch(url, options)
    .then((res) => {
      if (!res.ok || res.status < 200 || res.stauts >= 300) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .then((data) => callback(data));
}
