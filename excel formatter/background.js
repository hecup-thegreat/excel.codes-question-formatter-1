let combinedData = [];

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "processData") {
    chrome.storage.local.get(['storedData'], (result) => {
      const currentData = message.data;
      
      if (result.storedData && result.storedData.length > 0) {
        chrome.scripting.executeScript({
          target: { tabId: sender.tab.id },
          func: (currentData, storedData) => {
            const combine = confirm(`You have ${currentData.length} new items. Combine with previous ${storedData.length} items?`);
            if (combine) {
              return [...storedData, ...currentData];
            }
            return currentData;
          },
          args: [currentData, result.storedData]
        }, (combined) => {
          const finalData = combined[0].result;
          chrome.storage.local.set({ storedData: finalData }, () => {
            // Open a new tab with the output page.
            chrome.tabs.create({ url: chrome.runtime.getURL("output.html") });
          });
        });
      } else {
        chrome.storage.local.set({ storedData: currentData }, () => {
          chrome.tabs.create({ url: chrome.runtime.getURL("output.html") });
        });
      }
    });
  }
});
