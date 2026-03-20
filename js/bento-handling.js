export async function BentoHandling() {
    const urlInputArea = document.getElementById('url-input-area');
    if (!urlInputArea) return;
    // Dev mode: delete all local data
    // await chrome.storage.local.clear()
    await settleSavedBentos();
    settleBentoSearch();
    urlInputArea.addEventListener('keydown', () => {
        urlInputArea.innerText = "paste your link";
    });
    urlInputArea.addEventListener('paste', (e) => {
        const url = e.clipboardData.getData('text');
        setTimeout(() => {
            urlInputArea.innerText = "paste your link";
            const id = crypto.randomUUID();
            const name = nameFormating(url);
            addBentoToBentoArea(id, name, url);
            saveNewBento(id, name, url);
        }, 500);
        updateBentoName();
        deleteBento();
    })
}

async function settleSavedBentos() {
    const {bentos: savedBentos = []} = await chrome.storage.local.get('bentos');
    for (const bento of savedBentos) {
        await addBentoToBentoArea(bento.id, bento.name, bento.url);
    }
    updateBentoName();
    deleteBento();
}

async function addBentoToBentoArea(id, name, url) {
    const bentoArea = document.getElementById('bento-area');
    if (!bentoArea) return;

    const newBento = await createBento(id, name, url);
    bentoArea.insertAdjacentHTML('afterbegin', newBento);
}

async function createBento(id, name, url) {
    const formatedUrl = urlFormating(url);
    const response = await fetch(chrome.runtime.getURL('components/bento.html'));
    let html = await response.text();
    html = html.replace('{{ url }}', url)
        .replace('{{ formatedUrl }}', formatedUrl)
        .replace('{{ name }}', name)
        .replace('{{ id }}', id);

    return html;
}

async function saveNewBento(id, name, url) {
    const defaultSection = "bento";
    const {bentos: savedBentos = []} = await chrome.storage.local.get('bentos');
    savedBentos.push({
        id: id,
        url: url,
        name: name,
        section: defaultSection
    });

    await chrome.storage.local.set({bentos: savedBentos});
}

export function deleteBento() {
    const bentoArea = document.getElementById('bento-area');
    if (!bentoArea) return;

    bentoArea.addEventListener('click', async (e) => {
        if (e.target.classList.contains('bento-delete')) {
            const bento = e.target.closest('.bento');
            const id = bento.dataset.id;
            const {bentos: savedBentos = []} = await chrome.storage.local.get('bentos');
            const updatedBentos = savedBentos.filter(item => item.id !== id);
            await chrome.storage.local.set({bentos: updatedBentos});
            bento.remove();
        }
    })
}

function updateBentoName() {
    const namesInput = document.querySelectorAll('.name-input');
    if (!namesInput) return;

    for (const nameInput of namesInput) {
        nameInput.addEventListener('blur', async (e) => {
            const newName = e.target.innerText.trim();
            const bentoId = e.target.closest('.bento')?.dataset.id;
            if (bentoId) {
                const {bentos: savedBentos = []} = await chrome.storage.local.get('bentos');
                const updatedBentos = savedBentos.map(bento =>
                    bento.id === bentoId ? {...bento, name: newName} : bento);
                await chrome.storage.local.set({bentos: updatedBentos});
            }
        })
    }
}

async function updateBentoCategory(id, newSection) {
    const {bentos: savedBentos = []} = await chrome.storage.local.get('bentos');
    const potentialBentos = savedBentos.filter(item => item.id === id);
    if (!potentialBentos.length) return;
     const bento = {...potentialBentos[0], section: newSection};

     /// FIx this function, implement it,  then when starting, put the bento at the right section
}

function settleBentoSearch() {
    const searchInput = document.getElementById("bento-search-input");
    searchInput.addEventListener("input", () => {
        const bentos = document.querySelectorAll("#bento-container .bento");
        if (!bentos.length) return;

        const value = searchInput.value.toLowerCase().trim();
        bentos.forEach(bento => {
            const name = bento.querySelector(".name-input")?.innerText.toLowerCase().trim();
            const url = bento.querySelector(".bento-link")?.innerText.toLowerCase().trim();

            if (name.includes(value) || url.includes(value)) {
                bento.style.display = "block";
            } else {
                bento.style.display = "none";
            }
        });
    });
}


const urlFormating = (rawUrl) => {
    if (!URL.canParse(rawUrl)) {
        return rawUrl.slice(0, 30) + '...';
    }

    return new URL(rawUrl).origin + '...';
}

const nameFormating = (url) => {
    if (!URL.canParse(url)) {
        return "coffee break?"
    }
    const hostname = new URL(url).hostname;

    return hostname.split('.')[0];
}
