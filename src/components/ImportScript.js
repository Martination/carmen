// import { useEffect } from 'react';

// const ImportScript = (resourceUrl) => {
//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src = resourceUrl;
//     script.id = resourceUrl;
//     document.body.appendChild(script);

//     return () => {
//       // document.body.removeChild(script);
//     }
//   }, [resourceUrl]);
// };

const ImportScript = async (resourceUrl) => {
  const script = document.createElement("script");
  script.src = resourceUrl;
  // script.async = true;
  script.id = resourceUrl;
  document.body.appendChild(script);
}

export default ImportScript;
