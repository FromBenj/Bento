export async function BentoHandling() {
    const urlInputArea = document.getElementById('url-input-area');
    if (!urlInputArea) return;
    // Dev mode: delete all local data
    // await chrome.storage.local.clear()
    await settleSavedBentos();
    collapseSections();
    settleBentoSearch();
    urlInputArea.addEventListener('click', () => {
        urlInputArea.innerText = '';
    })
    urlInputArea.addEventListener('paste', (e) => {
        const url = e.clipboardData.getData('text');
        setTimeout(() => {
            urlInputArea.innerText = "paste your link";
            const id = crypto.randomUUID();
            const name = nameFormating(url);
            saveNewBento(id, name, url);
            addBentoToCategorySection(id, name, url);

            const b = document.getElementById('bento-area');

        }, 500);
        updateBentoName();
        deleteBento();
        collapseSections();
    })
}

async function settleSavedBentos() {
    const {bentos: savedBentos = []} = await chrome.storage.local.get('bentos');
    for (const bento of savedBentos) {
        await addBentoToCategorySection(bento.id, bento.name, bento.url);
    }
    updateBentoName();
    deleteBento();
}

async function addBentoToCategorySection(id, name, url) {
    const {bentos: savedBentos = []} = await chrome.storage.local.get('bentos');
    const bentoData = savedBentos.filter(bento => bento.id === id);
    const bentoCategory = bentoData[0]?.category ?? "bento-area";
    const section = document.querySelector(`.panel-section#${bentoCategory}`);
    if (!section) return;

    const newBento = await createBento(id, name, url);
    section.insertAdjacentHTML('afterbegin', newBento);
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
    const defaultCategory = "bento-area";
    const {bentos: savedBentos = []} = await chrome.storage.local.get('bentos');
    savedBentos.push({
        id: id,
        url: url,
        name: name,
        category: defaultCategory
    });

    await chrome.storage.local.set({bentos: savedBentos});
}

export function deleteBento() {
    const sections = document.querySelectorAll('.panel-section');
    if (!sections.length) return;
    for (const section of sections) {
        section.addEventListener('click', async (e) => {
            if (e.target.classList.contains('bento-delete')) {
                const bento = e.target.closest('.bento');
                const id = bento.dataset.id;
                const {bentos: savedBentos = []} = await chrome.storage.local.get('bentos');
                const updatedBentos = savedBentos.filter(bento => bento.id !== id);
                await chrome.storage.local.set({bentos: updatedBentos});
                bento.remove();
            }
        })
    }
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

export async function updateBentoCategory(id, newCategory) {
    const {bentos: savedBentos = []} = await chrome.storage.local.get('bentos');
    const bentoIndex = savedBentos.findIndex(bento => bento.id === id);
    if (bentoIndex === -1) return;
    savedBentos[bentoIndex] = {...savedBentos[bentoIndex], category: newCategory};

    await chrome.storage.local.set({bentos: savedBentos});
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

function collapseSections() {
    const sections = document.querySelectorAll('.panel-section');
    if (!sections.length) return;

    for (const section of sections) {
        const children = section.children;
        if (children.length > 3) {
            for (let i = 3; i < children.length; i++) {
                children[i].style.display = "none";
                children[i].style.overflow = "hidden";
            }
            const showNextBentos = section.parentElement.querySelector('.show-next-bentos');
            if (!showNextBentos) return;

            const moreBtn = document.createElement('div');
            moreBtn.style.textAlign = "center";
            moreBtn.style.fontSize = "1rem";
            moreBtn.style.padding = "0 0.3rem";
            moreBtn.style.borderRadius = "100%";
            moreBtn.style.background = "linear-gradient(145deg, #b5f4da, #98cdb8)";
            moreBtn.style.boxShadow = "20px 20px 60px #90c2ad, -20px -20px 60px #c2ffeb";
            moreBtn.style.color = "#1c1c1e";
            moreBtn.style.transform = "scale(0.8)";
            moreBtn.style.fontSize = "1rem";
            moreBtn.style.cursor = "pointer";

            moreBtn.id = `${section.id}-more-btn`;
            moreBtn.classList.add("active");
            moreBtn.innerText = "+";
            showNextBentos.appendChild(moreBtn);
        }
    }
}

function collapseButton(button) {
    if (!button.classList.contains("active") && !button.classList.contains("inactive") ||
        (button.classList.contains("active") && button.classList.contains("inactive"))) {
        return;
    }
    button.addEventListener('click', () => {
    if (button.classList.contains("active")) {

    }


        button.innerText = "-";
    button.classList.replace("active", "inactive");
    })
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
