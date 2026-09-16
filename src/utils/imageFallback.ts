import placeholder from "../assets/newLogo.svg";
// Every admin thumbnail gets a local loading treatment without blocking its page.
document.addEventListener("load", event => {
  const target = event.target;
  if (target instanceof HTMLImageElement) target.classList.add("image-ready");
}, true);
document.addEventListener("error", event => {
  const target = event.target;
  if (target instanceof HTMLImageElement && target.src !== new URL(placeholder, document.baseURI).href) {
    target.src = placeholder;
    target.title = "Original image unavailable";
  }
}, true);
