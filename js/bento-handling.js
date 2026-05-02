import { setSearchBar, updateBentoName } from "./naming-features.js";
import { collapseButton, collapseSection } from "./collapse-section.js";

export async function BentoHandling() {
  // const urlInputArea = document.getElementById('url-input-area');
  // if (!urlInputArea) return;
  const catchZone = document.getElementById("catch-zone");
  if (!catchZone) return;
  // Dev mode: delete all local data
  // await chrome.storage.local.clear()
  await settleSavedBentos();
  collapseSection();
  collapseButton();
  setSearchBar();
  catchZone.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const url = tab?.url;
    if (!url) return;

    const name = nameFormating(url);
    const id = crypto.randomUUID();
    saveNewBento(id, name, url);
    addBentoToCategorySection(id, name, url);
    updateBentoName();
    deleteBento();
    collapseSection();
    collapseButton();
  });

  catchZone.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  catchZone.addEventListener("drop", (e) => {
    e.preventDefault();
    const url = e.dataTransfer.getData("text/uri-list");
    const name = nameFormating(url);
    const id = crypto.randomUUID();
    saveNewBento(id, name, url);
    addBentoToCategorySection(id, name, url);
  });
}

async function settleSavedBentos() {
  const { bentos: savedBentos = [] } = await chrome.storage.local.get("bentos");
  for (const bento of savedBentos) {
    await addBentoToCategorySection(bento.id, bento.name, bento.url);
  }
  updateBentoName();
  deleteBento();
}

async function addBentoToCategorySection(id, name, url) {
  const { bentos: savedBentos = [] } = await chrome.storage.local.get("bentos");
  const bentoData = savedBentos.filter((bento) => bento.id === id);
  const bentoCategory = bentoData[0]?.category ?? "bento-area";
  const section = document.querySelector(`.panel-section#${bentoCategory}`);
  if (!section) return;

  const newBento = await createBento(id, name, url);
  section.insertAdjacentHTML("afterbegin", newBento);
}

async function createBento(id, name, url) {
  const formatedUrl = urlFormating(url);
  const response = await fetch(chrome.runtime.getURL("components/bento.html"));
  let html = await response.text();
  html = html
    .replace("{{ url }}", url)
    .replace("{{ formatedUrl }}", formatedUrl)
    .replace("{{ name }}", name)
    .replace("{{ id }}", id);

  return html;
}

async function saveNewBento(id, name, url) {
  const defaultCategory = "bento-area";
  const { bentos: savedBentos = [] } = await chrome.storage.local.get("bentos");
  savedBentos.push({
    id: id,
    url: url,
    name: name,
    category: defaultCategory,
  });

  await chrome.storage.local.set({ bentos: savedBentos });
}

export function deleteBento() {
  const sections = document.querySelectorAll(".panel-section");
  if (!sections.length) return;
  for (const section of sections) {
    section.addEventListener("click", async (e) => {
      if (e.target.classList.contains("bento-delete")) {
        const bento = e.target.closest(".bento");
        const id = bento.dataset.id;
        const { bentos: savedBentos = [] } =
          await chrome.storage.local.get("bentos");
        const updatedBentos = savedBentos.filter((bento) => bento.id !== id);
        await chrome.storage.local.set({ bentos: updatedBentos });
        bento.remove();
      }
    });
  }
}

const urlFormating = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") return "unknown";

  if (!URL.canParse(rawUrl)) {
    return rawUrl.slice(0, 30) + "...";
  }

  return new URL(rawUrl).origin + "...";
};

const nameFormating = (url) => {
  if (!URL.canParse(url)) {
    return "coffee break?";
  }
  const hostname = new URL(url).hostname;

  return hostname.split(".")[0];
};
