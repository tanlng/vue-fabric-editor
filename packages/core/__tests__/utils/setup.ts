import Editor from '../../Editor.ts';
import { fabric } from 'fabric';

export function createEditor() {
  const editor = new Editor();
  const canvasElement = document.createElement('canvas');
  canvasElement.id = 'imageeditorCanvas';
  const canvas = new fabric.Canvas('imageeditorCanvas', {
    fireRightClick: true,
    stopContextMenu: true,
    controlsAboveOverlay: true,
    imageSmoothingEnabled: false,
    preserveObjectStacking: true,
  });
  editor.init(canvas);
  window.editor = editor;

  return {
    cleanUp: editor.destory(),
  };
}

export function initPlugin(plugin: any) {
  const editor = new Editor();
  const canvasElement = document.createElement('canvas');
  canvasElement.id = 'imageeditorCanvas';
  const canvas = new fabric.Canvas('imageeditorCanvas', {});
  const pluginInstance = new plugin(canvas, editor);

  return {
    pluginInstance,
    cleanUp: () => {
      editor.destory();
    },
  };
}
