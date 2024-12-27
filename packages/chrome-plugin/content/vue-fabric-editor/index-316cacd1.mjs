var y = (t, e, n) => new Promise((o, i) => {
  var r = (s) => {
    try {
      u(n.next(s));
    } catch (d) {
      i(d);
    }
  }, a = (s) => {
    try {
      u(n.throw(s));
    } catch (d) {
      i(d);
    }
  }, u = (s) => s.done ? o(s.value) : Promise.resolve(s.value).then(r, a);
  u((n = n.apply(t, e)).next());
});
import { d as E, r as D, c as B, o as Y, a as L, b as S, w as N, v as O, u as p, e as W, f as X, g as M, h as P, i as m, n as V, j as z, k as A, _ as q } from "./main-6f4648f6.mjs";
const T = () => {
  const t = localStorage.getItem("sharecreators-drag-config-ispage" + window.location.pathname) || "1", e = localStorage.getItem("sharecreators-drag-config-isdomain") || "1";
  return {
    isPage: t === "1",
    isDomain: e === "1"
  };
};
function R(t) {
  const e = t.target === window.document.documentElement;
  if (!(t.type === "mousedown") && e)
    return;
  if (t.target.tagName === "VIDEO")
    return {
      target: t.target,
      targetLink: I(t.target)
    };
  let o, i;
  if (o = G(t), o)
    return { target: o };
  if (window.location.href.includes("huaban.com")) {
    const r = o.closest(".pin");
    if (r) {
      const a = r.querySelector("p.description").getAttribute("data-formatted");
      a && a.length > 0 && (o.customTitle = a.trim());
    }
  }
  if (window.location.href.includes("youtube.com")) {
    const r = o.closest(".ytd-rich-item-renderer");
    if (r) {
      const a = r.querySelector("#video-title-link").innerText;
      a && a.length > 0 && (o.customTitle = a.trim());
    }
  }
  return i = i || I(o), $(i) || (i = void 0), i && i.indexOf("www.taobao.com/view_image.php") !== -1 && (i = void 0), { target: o, targetLink: i };
}
function I(t) {
  if (t && t.tagName && t.tagName.toLowerCase() === "a" && t.href)
    return _(t.href);
  const e = t.closest("a");
  if (e.length > 0 && e.href)
    return _(e.href);
}
function $(t) {
  return /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i.test(
    t
  );
}
function _(t) {
  t && t.includes(" ") && (t = t.split(" ")[0]);
  const e = document.createElement("a");
  return e.href = t, e.href;
}
function k(t) {
  for (; t !== null; ) {
    if (console.log(t.nodeName, t), t.nodeName === "IMG")
      return H(t);
    if (t.nodeName === "VIDEO")
      return U(t);
    if (t.style.backgroundImage !== "none" && (t.style.backgroundImage.includes("about:blank") || t.style.backgroundImage.includes("overlay")))
      return null;
    const e = getComputedStyle(t).getPropertyValue("background-image");
    if (e !== "none" && e.indexOf("about:blank") === -1 && e.indexOf("overlay") === -1) {
      const n = e.match(/url\("?(.+?)"?\)/);
      if (n && n[1])
        return n[1];
    }
    t = t.parentElement;
  }
}
function H(t) {
  if (t.src && !t.src.startsWith("blob:")) {
    if (typeof t.srcset == "string") {
      let e = F(t);
      if (e = e, e)
        return e;
    }
    return t.currentSrc || t.src;
  }
}
function F(t) {
  if (t.getAttribute("srcset") && t.currentSrc && t.currentSrc.indexOf("pximg") === -1) {
    let e = "", n = 0, o, i;
    return t.getAttribute("srcset").split(",").forEach(function(r) {
      i = r.trim().split(" "), o = parseInt(i[1]), o > n && (n = o, e = i[0]);
    }), e;
  } else
    return t.getAttribute("src");
}
function U(t) {
  let e;
  if (t.src)
    e = t.currentSrc || t.src;
  else {
    const n = t.querySelector("source");
    e = n && n.src || t.src;
  }
  if (e.indexOf(".mp4") > -1 || e.indexOf(".MP4") > -1 || e.indexOf(".webm") > -1 || e.indexOf(".WEBM") > -1)
    return e;
}
function G(t) {
  let e;
  const n = getComputedStyle(t.target).getPropertyValue("background-image");
  if ((t && t.target.nodeName == "IMG" || n != "none" && n.indexOf("about:blank") === -1 && n.indexOf("overlay") === -1) && (e = t.target, e && e.naturalWidth * e.naturalHeight < 10 && (e = void 0), e))
    return e;
  const o = t.target.querySelector("img");
  if (o)
    return o;
  if (e = Z(t.pageX, t.pageY), e || (e = j(t.pageX, t.pageY), e))
    return e;
  if (!e) {
    const i = document.querySelectorAll("img");
    let r = 9999999;
    for (let a = i.length - 1; a >= 0; a--) {
      const u = C(i[a], t.target);
      u != -1 && u < r && (e = i[a], r = u);
    }
  }
  if (!e) {
    let i = 9999999;
    const r = [...document.querySelectorAll("div")].filter(function(a) {
      return getComputedStyle(a).getPropertyValue("background-image") != "none";
    });
    for (let a = r.length - 1; a >= 0; a--) {
      const u = C(r[a], t.target);
      u != -1 && u < i && (e = r[a], i = u);
    }
  }
  return e;
}
function Z(t, e) {
  const n = document.querySelectorAll("img");
  let o = 9999999;
  for (let r = n.length - 1; r >= 0; r--) {
    const a = w(n[r], { x: t, y: e });
    if (a != -1 && a < o)
      return n[r];
  }
  o = 9999999;
  const i = [...document.querySelectorAll("div")].filter(function(r) {
    return getComputedStyle(r).getPropertyValue("background-image") != "none";
  });
  for (let r = i.length - 1; r >= 0; r--) {
    const a = w(i[r], { x: t, y: e });
    if (a != -1 && a < o)
      return i[r];
  }
}
function j(t, e) {
  const n = document.querySelectorAll("video"), o = 9999999;
  for (let i = n.length - 1; i >= 0; i--) {
    const r = w(n[i], { x: t, y: e });
    if (r != -1 && r < o)
      return n[i];
  }
}
function C(t, e) {
  const n = {
    width: t.clientWidth,
    height: t.clientHeight,
    x: t.getBoundingClientRect().left,
    y: t.getBoundingClientRect().top
  }, o = {
    width: e.clientWidth,
    height: e.clientHeight,
    x: e.getBoundingClientRect().left,
    y: e.getBoundingClientRect().top
  };
  if (n.y + n.height < o.y || n.y > o.y + o.height || n.x + n.width < o.x || n.x > o.x + o.width)
    return -1;
  {
    const i = parseInt(b(t));
    return i >= 0 ? Math.abs(n.x - o.x) + Math.abs(n.y - o.y) != 0 ? Math.abs(n.x - o.x) + Math.abs(n.y - o.y) - i : i : Math.abs(n.x - o.x) + Math.abs(n.y - o.y);
  }
}
function w(t, e) {
  const n = t.clientWidth, o = t.clientHeight, i = t.offsetLeft, r = t.offsetTop, a = [i, r, i + n, r + o], u = e;
  if (!(u[0] >= a[0] && u[0] <= a[2] && u[1] >= a[1] && u[1] <= a[3]))
    return -1;
  let s = Math.sqrt(Math.pow(u[0] - a[0], 2) + Math.pow(u[1] - a[1], 2));
  const d = b(t);
  return d >= 0 && (s -= 1e3 * d), s;
}
function b(t) {
  if (!t || t == document)
    return 0;
  const e = getComputedStyle(t).getPropertyValue("z-index");
  return isNaN(e) ? b(t.parentNode) : e;
}
const J = function(t) {
  return new Promise((e, n) => {
    chrome.runtime.sendMessage(t, (o) => {
      o.success ? e(o.data) : n(o);
    });
  });
}, K = { class: "imageeditor-content-drop-area-container" }, Q = { class: "imageeditor-content-drop-area-content" }, tt = { class: "icon" }, et = 1, nt = /* @__PURE__ */ E({
  __name: "index",
  setup(t) {
    const e = D({
      isOperated: !1,
      selectedFolderTeam: null,
      selectedFolderPrivate: null,
      left: 100,
      top: 100,
      isShow: !1,
      dragover: !1,
      pageX: 0,
      pageY: 0,
      clientX: 0,
      clientY: 0,
      target: null,
      selectFolderButton: {
        isDragOver: !1
      }
    }), n = B(() => ({
      left: Math.max(0, e.left) + "px",
      top: Math.max(0, e.top) + "px"
    }));
    function o(s) {
      return y(this, null, function* () {
        if (console.log("handleDragStart chrome"), !s.target || !s.target.nodeName || !["img", "a", "video"].includes(s.target.nodeName.toLowerCase()))
          return;
        const { isPage: d, isDomain: l } = T();
        if (!d || !l || s.target.closest("[contenteditable='true']"))
          return;
        var { target: c } = R(s);
        if (!c) {
          console.log("无法拖拽 target为空");
          return;
        }
        var f = k(c);
        if (!f) {
          console.log("无法拖拽 src为空");
          return;
        }
        e.target = c;
        const h = s.clientX, g = s.clientY;
        setTimeout(() => {
          var v = Math.abs(h - e.clientX), x = Math.abs(g - e.clientY);
          (v > 1 || x > 1) && (v > x && et === 1 ? h <= e.clientX ? i({
            orientation: "Right",
            dragstartX: h,
            dragstartY: g
          }) : i({
            orientation: "Left",
            dragstartX: h,
            dragstartY: g
          }) : g >= e.clientY ? i({ orientation: "Top", dragstartX: h, dragstartY: g }) : g < e.clientY && i({
            orientation: "Bottom",
            dragstartX: h,
            dragstartY: g
          }));
        }, 100);
      });
    }
    function i({ dragstartX: s, dragstartY: d, orientation: l }) {
      var c = s, f = d;
      s === 0 && d === 0 || (l === "Top" ? (c = c - 120, f = f - 240 - 80, f < 0 && (f = 0), c + 240 > window.innerWidth && (c = window.innerWidth - 240)) : l === "Bottom" ? (c = c - 120, f = f + 80, f < 0 && (f = 0), c + 240 > window.innerWidth && (c = window.innerWidth - 240)) : l === "Right" ? (c = c + 80, f = f - 120, f < 0 && (f = 0), c + 240 > window.innerWidth && (c = window.innerWidth - 240)) : (f = f - 120, c = c - 80 - 240, f < 0 && (f = 0), c < 0 && (c = 0)), e.left = c, e.top = f, e.isShow = !0);
    }
    function r(s) {
      e.pageX = s.pageX, e.pageY = s.pageY, e.clientX = s.clientX, e.clientY = s.clientY;
    }
    function a() {
      e.isShow = !1, e.target = null;
    }
    function u() {
      return y(this, null, function* () {
        const s = k(e.target);
        if (!s) {
          console.error("无法识别的拖拽元素"), e.isShow = !1, e.target = null;
          return;
        }
        yield J({
          action: "openImageEditor",
          data: {
            url: s
          }
        }), e.isShow = !1;
      });
    }
    return Y(() => {
      console.log("插件加载"), document.body.addEventListener("dragstart", o), document.body.addEventListener("mousemove", r), document.body.addEventListener("dragend", a);
    }), L(() => {
      document.body.removeEventListener("dragstart", o), document.body.addEventListener("mousemove", r), document.body.removeEventListener("dragend", a);
    }), (s, d) => {
      const l = S("Icon"), c = S("Card");
      return N((W(), X("div", K, [
        M(c, {
          id: "imageeditor-content-drop-area",
          class: V(["imageeditor-content-drop-area", {
            dragover: p(e).dragover
          }]),
          style: z(p(n)),
          onDragover: [
            d[0] || (d[0] = (f) => p(e).dragover = !0),
            d[2] || (d[2] = A(() => {
            }, ["prevent"]))
          ],
          onDragleave: d[1] || (d[1] = (f) => p(e).dragover = !1)
        }, {
          default: P(() => [
            m("div", {
              onDrop: u,
              onClick: u
            }, [
              m("div", Q, [
                m("div", tt, [
                  M(l, {
                    size: 48,
                    type: "ios-image"
                  })
                ]),
                d[3] || (d[3] = m("div", { class: "title" }, "拖放图片到这里进行编辑", -1)),
                d[4] || (d[4] = m("div", { class: "description" }, "拖放图片到这里进行编辑", -1))
              ])
            ], 32)
          ]),
          _: 1
        }, 8, ["class", "style"])
      ], 512)), [
        [O, p(e).isShow]
      ]);
    };
  }
});
const rt = /* @__PURE__ */ q(nt, [["__scopeId", "data-v-7f820167"]]);
export {
  rt as default
};
