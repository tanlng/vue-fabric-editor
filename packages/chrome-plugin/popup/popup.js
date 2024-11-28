console.log('chrome.tabs', chrome.tabs);
const tabs = await chrome.tabs.query({});
// const tabs = await chrome.tabs.query({
//   url: [
//     'https://developer.chrome.com/docs/webstore/*',
//     'https://developer.chrome.com/docs/extensions/*',
//   ],
// });
console.log('tabs', tabs);

/**
 * 将焦点置于标签页
 * 首先，该扩展程序会按字母顺序对标签页名称（包含的 HTML 网页的标题）进行排序。然后，当点击某个列表项时，它会使用 tabs.update() 将焦点移至该标签页，并使用 windows.update() 将该窗口置于前台。
 */
const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));

const template = document.getElementById('li_template');
const elements = new Set();
for (const tab of tabs) {
  const element = template.content.firstElementChild.cloneNode(true);

  const title = tab.title.split('-')[0].trim();
  const pathname = new URL(tab.url).pathname.slice('/docs'.length);

  element.querySelector('.title').textContent = title;
  element.querySelector('.pathname').textContent = pathname;
  element.querySelector('a').addEventListener('click', async () => {
    // need to focus window as well as the active tab
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  });

  elements.add(element);
}
document.querySelector('ul').append(...elements);

// 创建一个按钮，该按钮将使用 tabs.group() 对所有标签页进行分组，并将其移至当前窗口。
const button = document.querySelector('button');
button.addEventListener('click', async () => {
  const tabIds = tabs.map(({ id }) => id);
  if (tabIds.length) {
    const group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(group, { title: 'DOCS' });
  }
});
