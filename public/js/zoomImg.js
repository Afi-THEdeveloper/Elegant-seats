function zoomImg(img) {
  img.onclick = () => {
    const div = document.createElement("div");
    const mask = document.createElement("div");
    const imgEl = document.createElement("img");

    div.style.position = "fixed";
    div.style.inset = "0";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.zIndex = "1040";

    mask.style.position = "fixed";
    mask.style.inset = "0";
    mask.style.backgroundColor = "rgba(0, 0, 0, .5)";
    mask.style.backdropFilter = 'blur(10px)'

    imgEl.src = img.src;
    imgEl.style.position = "relative";

    div.appendChild(mask);
    div.appendChild(imgEl);
    document.body.appendChild(div);

    mask.onclick = () => {
      div.removeChild(mask);
      div.removeChild(imgEl);
      document.body.removeChild(div);
    };
  };
}
