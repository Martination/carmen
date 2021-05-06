const ImportScript = async (resourceUrl) => {
  const script = document.createElement("script");
  script.src = resourceUrl;
  script.id = resourceUrl;
  document.body.appendChild(script);
}

export default ImportScript;
