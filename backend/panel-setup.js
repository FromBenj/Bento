export function setupSidePanel() {
    chrome.runtime.onInstalled.addListener(() => {
        console.log("Installed!");
    });

    chrome.action.onClicked.addListener(async (tab) => {
        await chrome.sidePanel.open({
            tabId: tab.id
        });
    });
}
