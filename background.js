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

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.message === "generate-script") {
    const { elements } = await chrome.storage.local.get(["elements"]);
    const script = await generateScript(elements);
    await chrome.storage.local.set({ script });
  }
});

function generateScript(elements) {
  return new Promise((resolve, reject) => {
    let script = ``;
    elements.forEach((element, index) => {
      script += `var __element${index} = document.querySelectorAll("${generateQuery(
        element
      )}")
    `;

      switch (element.tag) {
        case "A":
          script += `
        var __links = document.getElementsByTagName("a");
        for (var k = 0; k < __links.length; k++) {
          if (__links[k].href.includes(__urlLink)) {
          var href = __links[k].href;
          href =
            href.trim() +
            (href.indexOf("?") > 0 ? "&" : "?") +
            document.location.search.replace("?", "").toString();
          __links[k].href = href;
          }
        }
        `;
          break;
        case "BUTTON":
          script += `
        for(var k = 0; k < __element${index}.length; k++) {
           if(__element${index}[k].type === "submit") {
            var __formElement = document.querySelector("form")
            __formElement.onsubmit =  (e) => {
              e.preventDefault();

            __urlLink =
              __urlLink.trim() +
              (__urlLink.indexOf("?") > 0 ? "&" : "?") +
              document.location.search.replace("?", "").toString();

            window.location.href = __urlLink;
          };
          } else {
            __element${index}[k].addEventListener("click", (e) => {
              e.preventDefault();
          
              __urlLink =
                __urlLink.trim() +
                (__urlLink.indexOf("?") > 0 ? "&" : "?") +
                document.location.search.replace("?", "").toString();

              window.location.href = __urlLink;
            });
          }
        }
        `;
          break;
        default:
          script += `
        for(var k = 0; k < __element${index}.length; k++) {
          __element${index}[k].addEventListener("click", (e) => {
            e.preventDefault();

            __urlLink =
              __urlLink.trim() +
              (__urlLink.indexOf("?") > 0 ? "&" : "?") +
              document.location.search.replace("?", "").toString();

            window.location.href = __urlLink;
          });
        }
         `;
      }
    });

    resolve(script);
  });
}

function generateQuery(element) {
  let query = `${element.tag.toLowerCase()}`;
  element.attributes.forEach((attr) => {
    query += attr.class ? `.${attr.attr.replace(/ /g, ".")}` : "";
    query += attr.id ? `#${attr.attr}` : "";
  });

  return query;
}
