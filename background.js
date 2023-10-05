chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  const nextState = prevState === "ON" ? "OFF" : "ON";

  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  });

  if (nextState === "ON") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: (message) => {
        // Enviar a mensagem "ON" para o script na página
        window.postMessage({ type: "extension-state", message }, "*");
      },
      args: ["ON"],
    });
  } else if (nextState === "OFF") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: (message) => {
        // Enviar a mensagem "OFF" para o script na página
        window.postMessage({ type: "extension-state", message }, "*");
      },
      args: ["OFF"],
    });
  }
});
