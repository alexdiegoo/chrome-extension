async function getElement(e) {
  if (e.target.id === "nemu-extension") {
    return;
  }

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
    showInterface();

    window.onbeforeunload = function () {
      return "";
    };
  }

  if (request.state === "OFF") {
    document.removeEventListener("click", getElement);
    closeInterface();
    await chrome.storage.local.set({ elements: [] });
  }
});

async function handleClick(event) {
  if (event === "select-elements") {
    alert("Selecione os botões que levam para a próxima página.");
    document.addEventListener("click", getElement);
  }

  if (event === "generate-script") {
    const nemuExtension = document.querySelector("#nemu-extension").shadowRoot;
    const url = nemuExtension.querySelector("#nemu-input").value;

    if (url === "") {
      alert("Por favor, insira a URL no campo indicado.");
      return;
    }

    await chrome.runtime.sendMessage({
      message: "generate-script",
    });

    nemuExtension.querySelector("#nemu-code").innerHTML = "";
    nemuExtension.querySelector("#nemu-loading").classList.remove("hidden");

    setTimeout(async () => {
      const storageScript = await chrome.storage.local.get(["script"]);

      const script = `
&lt;script&gt;
  window.onload = function() {
  var __urlLink = "${url}";
${storageScript.script}
      }
&lt;/script&gt;`;

      nemuExtension.querySelector("#nemu-loading").classList.add("hidden");
      nemuExtension.querySelector("#nemu-code").innerHTML = script;
    }, 1000);
  }
}

function showInterface() {
  const interface = document.createElement("div");
  interface.setAttribute("id", "nemu-extension");

  const shadowRoot = interface.attachShadow({ mode: "open" });

  const html = document.createElement("html");

  html.innerHTML = `
   <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&family=Roboto:wght@400;700&display=swap" rel="stylesheet">

    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Roboto', sans-serif;
      }

    @keyframes slideRight {
      from {
        right: -200px;
      }

      to {
        right: 20px;
      }
    }

     #nemu-extension {
      animation: slideRight 0.5s ease forwards;
      z-index: 99999999;
      position: fixed;
      top: 20px;
      right: 20px;
      width: 30%;
      max-width: 280px;
      padding: 20px;
      border-radius: 16px;
      background-color: #212121;
      color: #fff;

      display: flex;
      gap: 20px;
      flex-direction: column;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
    }

    #nemu-extension .nemu-logo {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    #nemu-extension .nemu-logo img {
      width: 100px;
    }

    #nemu-input {
      width: 100%;
      height: 32px;
      padding: 8px;
      border: none;
      border-radius: 4px;
      margin-top: 14px;
      margin-bottom: 14px;

    }

    .nemu-button {
      width: 100%;
      height: 28px;
      padding: 4px;
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;

      font-family: 'Inter', sans-serif;
      font-weight: 700;
    }

    #nemu-generate-script-button {
      background-color: #5b21b6;
      margin-top: 8px;
    }

    #nemu-select-elements-button {
      border: 1px solid #5b21b6;
      background: none;
    }

    #nemu-script {
      max-height: 200px;
      overflow-y: auto;
    }

    .input-group label {
      font-size: 14px;
      font-weight: 700;
    }

    #nemu-loading {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    #nemu-loading.hidden {
      display: none;
    }

    .lds-ellipsis {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-ellipsis div {
  position: absolute;
  top: 33px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}
.lds-ellipsis div:nth-child(1) {
  left: 8px;
  animation: lds-ellipsis1 0.6s infinite;
}
.lds-ellipsis div:nth-child(2) {
  left: 8px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(3) {
  left: 32px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(4) {
  left: 56px;
  animation: lds-ellipsis3 0.6s infinite;
}
@keyframes lds-ellipsis1 {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes lds-ellipsis3 {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
@keyframes lds-ellipsis2 {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(24px, 0);
  }
}

    </style>
  </head>
  <body>
    <div id="nemu-extension">
      <div class="nemu-logo">
        <img src="https://app.nemu.com.br/static/media/logo-nemu-2.fb092989ff963fe1349c.png" />
      </div>

      <div class="input-group">
        <label for="nemu-input"
          >URL da próxima página do funil 👇</label
        >
        <input id="nemu-input" type="text" placeholder="https://example.com" />
        <button class="nemu-button" id="nemu-select-elements-button">Selecionar Elementos</button>
        <button class="nemu-button" id="nemu-generate-script-button">Gerar Script</button>
      </div>
      <div id="nemu-loading" class="hidden">
      <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
      </div>
      
      <div id="nemu-script">
        <pre>
        <code id="nemu-code">

        </code>
    </pre>
      </div>
    </div>
  </body>`;

  shadowRoot.appendChild(html);
  document.body.appendChild(interface);

  const selectElementsButton = document
    .getElementById("nemu-extension")
    .shadowRoot.querySelector("#nemu-select-elements-button");
  const generateScriptButton = document
    .getElementById("nemu-extension")
    .shadowRoot.querySelector("#nemu-generate-script-button");

  selectElementsButton.addEventListener("click", () =>
    handleClick("select-elements")
  );

  generateScriptButton.addEventListener("click", () =>
    handleClick("generate-script")
  );
}

function closeInterface() {
  document
    .querySelector("body")
    .removeChild(document.getElementById("nemu-extension"));
}
