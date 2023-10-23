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

  await chrome.tabs.sendMessage(tab.id, { state: nextState });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log(changes.elements.newValue);
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "generate-script") {
    const { elements } = await chrome.storage.local.get(["elements"]);
    generateScript(elements);
  }
});

function generateScript(elements) {
  let script = ``;
  elements.forEach((element, index) => {
    script += `const element${index} = document.querySelector("${generateQuery(
      element
    )}")`;

    if (element.tag === "A") {
      script += `
        var links = document.getElementsByTagName("a");
        for (var i = 0, n = links.length; i < n; i++) {
          if (links[i].href.includes(element${index}.href)) {
          var href = links[i].href.replace(/#/g, "");
          href =
            href.trim() +
            (href.indexOf("?") > 0 ? "&" : "?") +
            document.location.search.replace("?", "").toString();
          links[i].href = href;
          }
        }
      `;
    } else if (element.tag === "BUTTON") {
      script += `
        element${index}.addEventListener("submit", () => {
          const params = window.location.search;
          const URL = "cole a sua url aqui";

          window.location.href = URL + params;
        });
      `;
    } else {
      script += `
        element${index}.addEventListener("click", () => {
          const params = window.location.search;
          const URL = "cole a sua url aqui";

          window.location.href = URL + params;
        });
      `;
    }
  });

  console.log(script);
}

function generateQuery(element) {
  let query = `${element.tag.toLowerCase()}`;
  element.attributes.forEach((attr) => {
    query += attr.class ? `.${attr.attr.replace(/ /g, ".")}` : "";
    query += attr.id ? `#${attr.attr}` : "";
  });

  return query;
}
