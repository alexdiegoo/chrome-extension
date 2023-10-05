async function getElement(e) {
  alert("Elemento clicado! " + e.target.tagName);
}

// Função para lidar com mensagens da extensão
const handleMessage = (event) => {
  if (event.data.type === "extension-state" && event.data.message === "OFF") {
    alert("Extensão desativada");
    document.removeEventListener("click", getElement);
  }

  if (event.data.type === "extension-state" && event.data.message === "ON") {
    document.addEventListener("click", getElement);
  }
};

// Adicione um ouvinte de eventos para mensagens da extensão
window.addEventListener("message", handleMessage);
