export function setSearchBar() {
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

export function updateBentoName() {
    const nameInputs = document.querySelectorAll('.name-input');
    if (!nameInputs) return;

    for (const nameInput of nameInputs) {
        imposeDoubleClick(nameInput);
        nameInput.addEventListener('blur', async (e) => {
            const newName = e.target.innerText.trim();
            const bentoId = e.target.closest('.bento')?.dataset.id;
            if (bentoId) {
                const {bentos: savedBentos = []} = await chrome.storage.local.get('bentos');
                const updatedBentos = savedBentos.map(bento =>
                    bento.id === bentoId ? {...bento, name: newName} : bento);
                await chrome.storage.local.set({bentos: updatedBentos});
            }
            nameInput.contentEditable = "false";
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

function imposeDoubleClick(nameInput) {
    if (!nameInput.classList.contains('name-input')) return;

    let clickCount = 0;
    let timer;
    nameInput.addEventListener('mousedown', () => {
        clickCount++;
        clearTimeout(timer);
        timer = setTimeout(() => clickCount = 0, 500);
        if (clickCount > 1) {
            nameInput.contentEditable = "true";
            nameInput.focus();
            clickCount = 0;
        }
    });
}
