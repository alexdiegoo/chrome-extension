async function getElement(e) {
  alert("Elemento clicado! " + e.target.tagName);
  const { elements } = await chrome.storage.local.get(["elements"]);

  const attributes = [
    {
      class: e.target.attributes.getNamedItem("class") ? true : false,
      attr: e.target.attributes.getNamedItem("class")?.value,
    },
    {
      id: e.target.attributes.getNamedItem("id") ? true : false,
      attr: e.target.attributes.getNamedItem("id")?.value,
    },
  ];

  if (elements) {
    await chrome.storage.local.set({
      elements: [...elements, { tag: e.target.tagName, attributes }],
    });
  } else {
    await chrome.storage.local.set({
      elements: [{ tag: e.target.tagName, attributes }],
    });
  }
}

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.state === "ON") {
    alert("Extensão ativada!");
    document.addEventListener("click", getElement);

    window.onbeforeunload = function () {
      return "";
    };
  }

  if (request.state === "OFF") {
    alert("Extensão desativada!");

    document.removeEventListener("click", getElement);
    await chrome.storage.local.set({ elements: [] });
  }
});
