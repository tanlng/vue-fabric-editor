/*
 * @Author: 秦少卫
 * @Date: 2024-07-06 12:34:00
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-07-06 17:11:03
 * @Description: 基础元素类型添加
 */

import { fabric } from 'fabric';
import type { IEditor, IPluginTempl } from '@kuaitu/core';
import { v4 as uuid } from 'uuid';

type IPlugin = Pick<AddBaseTypePlugin, 'addBaseType' | 'createImgByElement' | 'createImgByUrl'>;

const MAX_SIZE = 4096; // 最大尺寸
declare module '@kuaitu/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface IEditor extends IPlugin {}
}

// 将某一图层生成快照
async function generateSnapshot(originImg: fabric.Image) {
  const cloneImg = (await new Promise((rs) => {
    originImg.cloneAsImage(rs);
  })) as fabric.Image;
  console.log(cloneImg.left);
  const width = cloneImg.getScaledWidth();
  const height = cloneImg.getScaledHeight();

  const canvas = new fabric.StaticCanvas(document.createElement('canvas'));
  canvas.add(cloneImg);

  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  const option = {
    name: 'New Image',
    format: 'webp',
    quality: 1,
    width: width,
    height: height,
  };
  const dataUrl = canvas.toDataURL(option);
  return dataUrl;
}

/** 当加载的图片大于画布尺寸后，缩放图片，并生成副本 */
async function scaleImage(img: fabric.Image, maxWidth: number, maxHeight: number) {
  let scale = 1;
  if (!img.width || !img.height) {
    console.error('图片没有宽高尺寸');
    return false;
  }
  const widthRatio = maxWidth / img.width;
  const heightRatio = maxHeight / img.height;
  if (widthRatio > 1 && heightRatio > 1) {
    return false;
  }
  scale = Math.min(widthRatio, heightRatio);
  img.scale(scale);
  return await generateSnapshot(img);
}
export default class AddBaseTypePlugin implements IPluginTempl {
  static pluginName = 'AddBaseTypePlugin';
  static apis = ['addBaseType', 'createImgByElement', 'createImgByUrl'];
  constructor(public canvas: fabric.Canvas, public editor: IEditor) {
    this.editor = editor;
    this.canvas = canvas;
  }

  addBaseType(
    item: fabric.Object,
    optons?: {
      event: DragEvent;
      scale: boolean;
      center: boolean;
      modifyCanvas?: boolean;
    }
  ) {
    const { event = false, scale = false, center = true, modifyCanvas = false } = optons || {};
    item.set({
      id: uuid(),
    });
    modifyCanvas && this._toFill(item);
    scale && this._toScale(item);
    event && this._toEvent(item, event);
    this.canvas.add(item);
    if (!event && center) {
      this._toCenter(item);
    }
    this.canvas.refreshHistory();
    this.canvas.setActiveObject(item);
    this.canvas.renderAll();
  }

  _toEvent(item: fabric.Object, event: DragEvent) {
    const { left, top } = this.canvas.getSelectionElement().getBoundingClientRect();
    if (event.x < left || event.y < top || item.width === undefined) return;
    const point = {
      x: event.x - left,
      y: event.y - top,
    };
    const pointerVpt = this.canvas.restorePointerVpt(point);
    item.set({
      left: pointerVpt.x,
      top: pointerVpt.y,
    });
  }

  _toCenter(item: fabric.Object) {
    this.canvas.setActiveObject(item);
    this.editor.position('center');
  }

  _toScale(item: fabric.Object) {
    const { width } = this.editor.getWorkspase();
    if (width === undefined) return;
    item.scaleToWidth(width / 2);
  }
  // 根据传入元素的尺寸，设置画布尺寸。确保新元素刚好充满画布
  _toFill(item: fabric.Object) {
    const workspace = this.getWorkspase() as Required<fabric.Rect>;
    this.editor.setSize(
      item.getScaledWidth() || workspace.width,
      item.getScaledHeight() || workspace.height
    );
  }
  getWorkspase() {
    return this.canvas.getObjects().find((item) => item.id === 'workspace') as fabric.Rect;
  }

  createImgByElement(target: HTMLImageElement) {
    return new Promise((resolve) => {
      const imgType = this.getImageExtension(target.src);
      if (imgType === 'svg') {
        fabric.loadSVGFromURL(target.src, (objects) => {
          const item = fabric.util.groupSVGElements(objects, {
            shadow: '',
            fontFamily: 'arial',
            name: 'svg元素',
          });
          resolve(item);
        });
      } else {
        fabric.Image.fromURL(
          target.src,
          (imgEl) => {
            resolve(imgEl);
          },
          { crossOrigin: 'anonymous' }
        );
      }
    });
  }
  calMaxImageWidth(modifyCanvas: boolean) {
    if (modifyCanvas) {
      return MAX_SIZE;
    }
    const workspace = this.getWorkspase();
    return Math.min(MAX_SIZE, workspace.getScaledWidth());
  }
  calMaxImageHeight(modifyCanvas: boolean) {
    if (modifyCanvas) {
      return MAX_SIZE;
    }
    const workspace = this.getWorkspase();
    return Math.min(MAX_SIZE, workspace.getScaledHeight());
  }

  async createImgByUrl(
    url: string,
    config: {
      showSpin?: boolean;
      modifyCanvas?: boolean;
    }
  ) {
    const option = {
      showSpin: true,
      modifyCanvas: false,
    };
    Object.assign(option, config);
    console.log('createImgByUrl', url);

    const fabricItem = await new Promise(
      (resolve: (value: fabric.Object | fabric.Group) => void) => {
        const imgType = this.getImageExtension(url);
        if (imgType === 'svg') {
          fabric.loadSVGFromURL(url, (objects) => {
            const item = fabric.util.groupSVGElements(objects, {
              shadow: '',
              fontFamily: 'arial',
              name: 'svg元素',
            });
            item.set({
              fileUrl: url,
            });
            resolve(item);
          });
        } else {
          fabric.Image.fromURL(
            url,
            async (imgEl) => {
              const scalarDataUrl = await scaleImage(
                imgEl,
                this.calMaxImageWidth(option.modifyCanvas),
                this.calMaxImageHeight(option.modifyCanvas)
              );
              if (scalarDataUrl) {
                imgEl = (await new Promise((rs) => {
                  fabric.Image.fromURL(scalarDataUrl, async (dataUrlImgEl) => {
                    rs(dataUrlImgEl);
                  });
                })) as fabric.Image;
                imgEl.set({
                  fileUrl: scalarDataUrl,
                });
              } else {
                imgEl.set({
                  fileUrl: url,
                });
              }
              resolve(imgEl);
            },
            {
              crossOrigin: 'anonymous',
            }
          );
        }
      }
    );
    return fabricItem;
  }

  getImageExtension(imageUrl: string) {
    const pathParts = imageUrl.split('/');
    const filename = pathParts[pathParts.length - 1];
    const fileParts = filename.split('.');
    return fileParts[fileParts.length - 1];
  }

  destroy() {
    console.log('pluginDestroy');
  }
}
