// import './modules/sw-omnibox.js';
// import './modules/sw-tips.js';

chrome.runtime.onInstalled.addListener(({ reason }) => {
  chrome.action.setBadgeText({
    text: 'OFF',
  });
});

const extensions = 'https://developer.chrome.com/docs/extensions';
const webstore = 'https://developer.chrome.com/docs/webstore';

console.log('add onClicked action');
chrome.action.onClicked.addListener(async (tab) => {
  chrome.windows.create({
    url: chrome.runtime.getURL('win/vue-fabric-editor/index.html'),
    type: 'popup',
    width: 1920,
    height: 1024,
    top: 100,
    focused: true,
  });
});
console.log('add onClicked action end');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'openImageEditor':
      chrome.windows.create({
        url: chrome.runtime.getURL(
          'win/vue-fabric-editor/index.html#/?url=' + encodeURIComponent(request.data.url)
        ),
        type: 'popup',
        width: 1920,
        height: 1024,
        top: 100,
        focused: true,
      });
      sendResponse({
        success: true,
      });
      break;
  }
});
