import placeholder from "../assets/newLogo.svg";
document.addEventListener("error", event => {
  const target = event.target;
  if (target instanceof HTMLImageElement && target.src !== new URL(placeholder, document.baseURI).href) {
    target.src = placeholder;
    target.title = "Original image unavailable";
  }
}, true);
