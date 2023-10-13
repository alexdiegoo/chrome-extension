async function getElement(e) {
  alert("Elemento clicado! " + e.target.tagName);
}

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.state === "ON") {
    alert("Extensão ativada!");
    document.addEventListener("click", getElement);
  }

  if (request.state === "OFF") {
    alert("Extensão desativada!");

    document.removeEventListener("click", getElement);
  }
});
