/**
 * 在 content.js 中判断是否可以拖拽
 * @date 2023-12-21
 * @returns {any}
 */
export const checkEnableDrag = async () => {
  const config = getDragConfig();
  return config.isPage && config.isDomain;
};

export const getDragConfig = () => {
  const pageStorage =
    localStorage.getItem('sharecreators-drag-config-ispage' + window.location.pathname) || '1';
  const domainStorage = localStorage.getItem('sharecreators-drag-config-isdomain') || '1';
  return {
    isPage: pageStorage === '1',
    isDomain: domainStorage === '1',
  };
};

/**
 * 设置当前页面是否使用拖拽
 * @date 2023-12-22
 * @param {any} "sharecreators-drag-config-ispage"
 * @param {any} isPage?"1":"0"
 * @returns {any}
 */
export const setDragConfigIsPage = (isPage: boolean) => {
  localStorage.setItem(
    'sharecreators-drag-config-ispage' + window.location.pathname,
    isPage ? '1' : '0'
  );
};
/**
 * 设置当前域名是否使用拖拽
 * @date 2023-12-22
 * @param {any} "sharecreators-drag-config-isdomain"
 * @param {any} isDomain?"1":"0"
 * @returns {any}
 */

export const setDragConfigIsDomain = (isDomain: boolean) => {
  localStorage.setItem('sharecreators-drag-config-isdomain', isDomain ? '1' : '0');
};

/**
 * @function setTarget
 * @param {Event} e - 事件对象
 * @returns {Object} - 包含目标元素和链接的对象
 * @description
 *   该函数接受一个 'e' 事件对象作为参数，并返回一个包含目标元素和链接（如果有的话）的对象。
 *   首先，它检查事件类型是否为鼠标点击，以及目标是否为文档对象。如果不是，则返回。
 *   然后，它检查目标是否为视频元素。如果是，则将目标设置为该元素，并从元素或其父元素中提取链接。
 *   接下来，它检查当前 URL 中是否包含 "huaban.com"，以处理specific case of Huaban。如果是，则找到包含点击目标的 pin 元素，并从其中提取描述。
 *   最后，它从目标元素或其父元素中提取链接。如果链接不是有效的 URL，则将其设置为 undefined。
 */
export function getHasSrcTarget(e: any) {
  // 检查事件类型是否为鼠标点击，以及目标是否为文档对象
  const isDocument = e.target === window.document.documentElement;
  const isMouseEvent = e.type === 'mousedown';
  if (!isMouseEvent && isDocument) {
    return;
  }
  // 检查目标是否为视频元素
  if (e.target.tagName === 'VIDEO') {
    return {
      target: e.target,
      targetLink: getClosestHref(e.target),
    };
  }

  let target = undefined;
  let targetLink = undefined;
  target = getClickImage(e);
  if (target) {
    return { target };
  }

  // 检查当前 URL 中是否包含 "huaban.com"，以处理specific case of Huaban
  if (window.location.href.includes('huaban.com')) {
    // 找到包含点击目标的 pin 元素，并从其中提取描述
    const pin = target.closest('.pin');
    if (pin) {
      const description = pin.querySelector('p.description').getAttribute('data-formatted');
      if (description && description.length > 0) {
        target.customTitle = description.trim();
      }
    }
  }

  // 检查当前 URL 中是否包含 "youtube.com"，以处理specific case of YouTube
  if (window.location.href.includes('youtube.com')) {
    // 找到包含点击目标的 grid 元素，并从其中提取标题
    const grid = target.closest('.ytd-rich-item-renderer');
    if (grid) {
      const description = grid.querySelector('#video-title-link').innerText;
      if (description && description.length > 0) {
        target.customTitle = description.trim();
      }
    }
  }
  targetLink = targetLink || getClosestHref(target);
  // 避免收藏非 url 字串，如 javascript::
  if (!isUrl(targetLink)) {
    targetLink = undefined;
  }

  // 从目标元素或其父元素中提取链接
  if (targetLink && targetLink.indexOf('www.taobao.com/view_image.php') !== -1) {
    targetLink = undefined;
  }

  return { target, targetLink };
}
function getClosestHref(target: HTMLLinkElement | null) {
  if (target && target.tagName) {
    if (target.tagName.toLowerCase() === 'a') {
      if (target.href) {
        return absolutePath(target.href);
      }
    }
  }

  //判断e.target 的父级中是否含有 a标签
  const $wrapLink = target.closest('a');
  if ($wrapLink.length > 0) {
    if ($wrapLink.href) {
      return absolutePath($wrapLink.href);
    }
  }
}

function isUrl(url) {
  return /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i.test(
    url
  );
}

/**
 * 将给定的 href 转换为绝对路径，通过创建一个新的 <a> 元素并返回其 href 属性实现。
 * 特别适用于处理可能包含额外文本或格式的链接，将相对路径转换为绝对路径。
 * @param {string} href - 要转换为绝对路径的输入 href。
 * @returns {string} - 转换后绝对路径的 href 属性。
 */
function absolutePath(href) {
  // 检查 href 是否为空且包含空格
  if (href && href.includes(' ')) {
    // 通过在空格字符上分割字符串并选择第一个元素来删除空格
    href = href.split(' ')[0];
  }

  // 创建一个新的 <a> 元素并设置其 href 属性为输入的 href
  const link = document.createElement('a');
  link.href = href;

  // 返回 <a> 元素的 href 属性，现在它是一个绝对路径
  return link.href;
}
/**
 * @function 这是一个获取指定元素的源（src属性）的函数 getBackgroundImage
 * @param {HTMLElement} element - 要获取源的元素
 * @returns {string|null} - 元素的源（src属性）或null
 * @description
 * 这是一个获取指定元素的源（src属性）的函数，该函数基于元素的类型。
 * 如果元素是图像、视频或具有背景-image属性的元素，则函数返回相应的src属性值。如果不符合这些条件，则函数返回null。
 * 该函数使用一个无限循环，直到元素为null。
 * 在循环内部，函数首先检查当前元素的nodeName。
 * 如果元素是IMG（图像），则函数调用getImgElementSrc函数并返回其结果。
 * 如果元素是VIDEO（视频），则函数调用getVideoElementSrc函数并返回其结果。
 * 如果元素的background-image属性值不是"none"，并且该属性值包含"about:blank"或"overlay"，则函数返回null。
 * 否则，函数使用正则表达式从属性值中提取URL，并返回该URL。
 * 如果元素的background-image属性值包含URL，则使用正则表达式提取URL。
 * 如果元素有父元素，则将元素更新为父元素。如果元素没有父元素，则返回null。
 */
export function getElementBackgroundImage(element) {
  // 无限循环，直到元素为 null
  while (element !== null) {
    console.log(element.nodeName, element);
    // 如果元素是 IMG（图像）
    if (element.nodeName === 'IMG') {
      // 调用 getImgElementSrc 函数并返回结果
      return getImgElementSrc(element);
    }
    // 如果元素是 VIDEO（视频）
    if (element.nodeName === 'VIDEO') {
      // 调用 getVideoElementSrc 函数并返回结果
      return getVideoElementSrc(element);
    }
    // 如果元素的 background-image 属性值不是 "none"，并且该属性值包含 "about:blank" 或 "overlay"
    if (
      element.style.backgroundImage !== 'none' &&
      (element.style.backgroundImage.includes('about:blank') ||
        element.style.backgroundImage.includes('overlay'))
    ) {
      // 返回 null
      return null;
    }
    const bg = getComputedStyle(element).getPropertyValue('background-image');
    if (bg !== 'none' && bg.indexOf('about:blank') === -1 && bg.indexOf('overlay') === -1) {
      const url = bg.match(/url\("?(.+?)"?\)/);
      if (url && url[1]) {
        return url[1];
      }
    }

    element = element.parentElement;
  }
}

function getImgElementSrc(element) {
  if (element.src && !element.src.startsWith('blob:')) {
    // 自动获取 srcset 最大图片
    if (typeof element.srcset === 'string') {
      // let src = getLargeSrcFromSrcset(element.srcset);

      let src = getHighestResImg(element);
      // console.log("src:" +src)
      src = convertSrc(src);

      // console.log("src1:" +src)
      if (src) {
        return src;
      }
    }
    return element.currentSrc || element.src;
  }
}

// 取得最大的 srcset
function getHighestResImg(element) {
  if (
    element.getAttribute('srcset') &&
    element.currentSrc &&
    element.currentSrc.indexOf('pximg') === -1
  ) {
    let highResImgUrl = '';
    let maxRes = 0;
    let imgWidth, urlWidthArr;
    element
      .getAttribute('srcset')
      .split(',')
      .forEach(function (item) {
        urlWidthArr = item.trim().split(' ');
        imgWidth = parseInt(urlWidthArr[1]);
        if (imgWidth > maxRes) {
          maxRes = imgWidth;
          highResImgUrl = urlWidthArr[0];
        }
      });
    return highResImgUrl;
  } else {
    return element.getAttribute('src');
  }
}

function convertSrc(src: string) {
  return src;
  // if (src.indexOf('data:image') > -1) return src;
  // // console.log("cacheRules:"+cacheRules)
  // // console.log("cacheRules.rules: "+cacheRules.rules)
  // if (cacheRules && cacheRules.rules) {
  //   for (let i = 0; i < cacheRules.rules.length; i++) {
  //     try {
  //       let rule = cacheRules.rules[i];
  //       let srcPattern = rule.srcPattern;
  //       let replaceRule = rule.replaceRule;
  //       let reg = RegExp(srcPattern);
  //       if (reg.test(src)) {
  //         let newSrc;
  //         let script = replaceRule.replace("'@'", 'src');
  //         eval('newSrc = ' + script);
  //         //console.log(`${rule.site} > ${newSrc}`);
  //         return newSrc;
  //       }
  //     } catch (err) {
  //       return src;
  //     }
  //   }
  // }
  // return src;
}

function getVideoElementSrc(element: HTMLMediaElement) {
  let src;
  if (element.src) {
    src = element.currentSrc || element.src;
  } else {
    const source = element.querySelector('source');
    src = (source && source.src) || element.src;
  }
  if (
    src.indexOf('.mp4') > -1 ||
    src.indexOf('.MP4') > -1 ||
    src.indexOf('.webm') > -1 ||
    src.indexOf('.WEBM') > -1
  ) {
    return src;
  }
  return undefined;
}

export function getClickImage(event) {
  let target;
  const bgi = getComputedStyle(event.target).getPropertyValue('background-image');
  if (
    (event && event.target.nodeName == 'IMG') ||
    (bgi != 'none' && bgi.indexOf('about:blank') === -1 && bgi.indexOf('overlay') === -1)
  ) {
    target = event.target;
    // 避免垃圾图片或者对方网站使用 1px gif 遮蔽拖拽
    if (target && target.naturalWidth * target.naturalHeight < 10) {
      target = undefined;
    }
    if (target) {
      return target;
    }
  }
  // 如果子级中含有图片则返回子元素
  const childImg = event.target.querySelector('img');
  if (childImg) {
    return childImg;
  }

  target = getXYImage(event.pageX, event.pageY);
  if (target) {
    return target;
  }

  target = getXYVideo(event.pageX, event.pageY);
  if (target) {
    return target;
  }

  if (!target) {
    const $imgs = document.querySelectorAll('img');
    let mini = 9999999;

    for (let i = $imgs.length - 1; i >= 0; i--) {
      const c = contain($imgs[i], event.target);
      if (c == -1) {
        continue;
      } else if (c < mini) {
        target = $imgs[i];
        mini = c;
      }
    }
  }

  if (!target) {
    mini = 9999999;
    const $bgs = [...document.querySelectorAll('div')].filter(function (el) {
      return getComputedStyle(el).getPropertyValue('background-image') != 'none';
    });
    for (let i = $bgs.length - 1; i >= 0; i--) {
      const c = contain($bgs[i], event.target);
      if (c == -1) {
        continue;
      } else if (c < mini) {
        target = $bgs[i];
        mini = c;
      }
    }
  }
  return target;
}
// 遍历img标签，计算出x,y坐标与图片的距离，距离最近的图片作为target
function getXYImage(x: number, y: number) {
  // 获取所有img标签
  const $imgs = document.querySelectorAll('img');
  // 初始化距离最近的图片的距离
  let mini = 9999999;

  // 遍历img标签
  for (let i = $imgs.length - 1; i >= 0; i--) {
    // 计算出x,y坐标与图片的距离
    const c = containPoint($imgs[i], { x: x, y: y });
    // 如果距离为-1，表示不包含在图片内，跳过
    if (c == -1) {
      continue;
      // 如果距离小于mini，更新target和mini
    } else if (c < mini) {
      return $imgs[i];
    }
  }

  // 如果target为空，表示没有找到图片，遍历div标签
  mini = 9999999;
  // 获取所有div标签
  const $bgs = [...document.querySelectorAll('div')].filter(function (el) {
    // 过滤出背景图片不为空的div标签
    return getComputedStyle(el).getPropertyValue('background-image') != 'none';
  });
  // 遍历div标签
  for (let i = $bgs.length - 1; i >= 0; i--) {
    // 计算出x,y坐标与div的距离
    const c = containPoint($bgs[i], { x: x, y: y });
    // 如果距离为-1，表示不包含在div内，跳过
    if (c == -1) {
      continue;
      // 如果距离小于mini，更新target和mini
    } else if (c < mini) {
      return $bgs[i];
    }
  }
}

/**
 * @function getXYVideo
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 * @returns {void}
 */
function getXYVideo(x, y) {
  // 获取所有视频元素
  const $videos = document.querySelectorAll('video');

  // 初始化最小距离为 9999999
  const mini = 9999999;

  // 遍历所有视频元素
  for (let i = $videos.length - 1; i >= 0; i--) {
    // 计算视频元素与给定坐标点的距离
    const c = containPoint($videos[i], { x: x, y: y });

    // 如果距离为 -1，表示坐标点不在视频元素内部，跳过该元素
    if (c == -1) {
      continue;
    } else if (c < mini) {
      // 如果距离小于当前最小距离，更新目标元素和最小距离
      return $videos[i];
    }
  }
}
/**
 * @function contain
 * @param {Element} element - 要检查的元素
 * @param {Element} container - 要检查的容器元素
 * @returns {number} - 元素与容器之间的距离，如果元素不在容器内部，则返回 -1
 */
function contain(element, container) {
  // 获取元素和容器的宽度和高度
  const a = {
    width: element.clientWidth,
    height: element.clientHeight,
    x: element.getBoundingClientRect().left,
    y: element.getBoundingClientRect().top,
  };
  const b = {
    width: container.clientWidth,
    height: container.clientHeight,
    x: container.getBoundingClientRect().left,
    y: container.getBoundingClientRect().top,
  };

  // 检查元素是否在容器内部
  if (
    !(a.y + a.height < b.y || a.y > b.y + b.height || a.x + a.width < b.x || a.x > b.x + b.width)
  ) {
    // 如果元素在容器内部，获取元素的 z-index 值
    const aZindex = parseInt(getZIndex(element));

    // 如果元素的 z-index 大于等于 0，则计算元素与容器之间的距离减去 z-index
    if (aZindex >= 0) {
      if (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) != 0) {
        // 如果元素与容器之间的距离不为 0，则返回距离减去 z-index
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) - aZindex;
      } else {
        // 如果元素与容器之间的距离为 0，则返回 z-index
        return aZindex;
      }
    } else {
      // 如果元素的 z-index 小于 0，则返回元素与容器之间的距离
      return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
  } else {
    // 如果元素不在容器内部，则返回 -1
    return -1;
  }
}

/**
 * @function containPoint
 * @param {Element} element - 要检查的视频元素
 * @param {Array} point - 要检查的坐标点
 * @returns {number} - 视频元素与坐标点之间的距离，如果坐标点不在视频元素范围内，则返回 -1
 */
function containPoint(element: HTMLImageElement | HTMLVideoElement, point: any) {
  // 获取视频元素的宽度和高度
  const width = element.clientWidth;
  const height = element.clientHeight;

  // 获取视频元素相对于视口的位置
  const left = element.offsetLeft;
  const top = element.offsetTop;

  // 将视频元素的坐标和宽度和高度存储在变量 a 中
  const a = [left, top, left + width, top + height];

  // 将坐标点存储在变量 b 中
  const b = point;

  // 检查给定的坐标点是否在视频元素的范围内
  if (!(b[0] >= a[0] && b[0] <= a[2] && b[1] >= a[1] && b[1] <= a[3])) {
    // 如果坐标点不在范围内，则返回 -1
    return -1;
  }

  // 计算视频元素与坐标点之间的距离，并考虑视频元素的 z-index 值
  let distance = Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2));
  const zIndex = getZIndex(element);
  if (zIndex >= 0) {
    // 如果 z-index 大于等于 0，则将距离减去 1000 * z-index，以考虑 z-index 对距离的影响
    distance -= 1000 * zIndex;
  }

  // 返回距离作为结果
  return distance;
}

/**
 * @function getZIndex
 * @param {Element} element - 要获取 z-index 值的元素
 * @returns {number} - 元素的 z-index 值，如果元素没有定义 z-index 值，则返回 0
 */
function getZIndex(element: ParentNode | null) {
  if (!element) return 0;
  if (element == document) return 0;
  const z = getComputedStyle(element as Element).getPropertyValue('z-index') as any;
  if (isNaN(z)) return getZIndex(element.parentNode);
  else return z;
}
