import FabricGuideLine from '@kuaitu/core';

declare namespace fabric {
  export interface Canvas {
    contextTop: CanvasRenderingContext2D;
    lowerCanvasEl: HTMLElement;
    wrapperEl: HTMLElement;
    isDragging: boolean;
    historyProcessing: boolean;
    _currentTransform: unknown;
    extraProps: any;
    clearHistory(boolean?): void;
    clearUndo(): void;
    _historyNext(): void;
    _historyInit(): void;
    offHistory(): void;
    _centerObject: (obj: fabric.FabricObject, center: fabric.Point) => fabric.Canvas;
    _setupCurrentTransform(e: Event, target: fabric.FabricObject, alreadySelected: boolean): void;
  }

  export interface Control {
    rotate: number;
  }

  export interface Image {
    extensionType?: string;
    extension: any;
  }

  export interface Object {
    extensionType?: string;
    extension: any;
    type: string;
    height: number;
    top: number;
    left: number;
    lockMovementX: boolean;
    lockMovementY: boolean;
    lockRotation: boolean;
    lockScalingX: boolean;
    lockScalingY: boolean;
    forEachObject?: ICollection.forEachObject;
    fontFamily?: string;
    _objects?: ICollection.Object[];
    aCoords?: any;
    [string]?: any;
  }
  export interface Group {
    _objects: ICollection.Object[];
  }
  export interface IObjectOptions {
    /**
     * 标识
     */
    id?: string | undefined;
  }

  export interface IUtil {
    findScaleToFit: (
      source: Record<string, unknown> | fabric.FabricObject,
      destination: Record<string, unknown> | fabric.FabricObject
    ) => number;
  }

  function ControlMouseEventHandler(
    eventData: MouseEvent,
    transformData: Transform,
    x: number,
    y: number
  ): boolean;
  function ControlStringHandler(
    eventData: MouseEvent,
    control: fabric.Control,
    fabricObject: fabric.FabricObject
  ): string;
  export const controlsUtils: {
    rotationWithSnapping: ControlMouseEventHandler;
    scalingEqually: ControlMouseEventHandler;
    scalingYOrSkewingX: ControlMouseEventHandler;
    scalingXOrSkewingY: ControlMouseEventHandler;

    scaleCursorStyleHandler: ControlStringHandler;
    scaleSkewCursorStyleHandler: ControlStringHandler;
    scaleOrSkewActionName: ControlStringHandler;
    rotationStyleHandler: ControlStringHandler;
  };

  type EventNameExt = 'removed' | EventName;

  export interface IObservable<T> {
    on(
      eventName: 'guideline:moving' | 'guideline:mouseup',
      handler: (event: { e: Event; target: FabricGuideLine }) => void
    ): T;
    on(events: { [key: EventName]: (event: { e: Event; target: FabricGuideLine }) => void }): T;
  }

  export interface IGuideLineOptions extends ILineOptions {
    axis: 'horizontal' | 'vertical';
  }

  export interface IGuideLineClassOptions extends IGuideLineOptions {
    canvas: {
      setActiveObject(object: fabric.FabricObject | FabricGuideLine, e?: Event): Canvas;
      remove<T>(...object: (fabric.FabricObject | FabricGuideLine)[]): T;
    } & Canvas;
    activeOn: 'down' | 'up';
    initialize(xy: number, objObjects: IGuideLineOptions): void;
    callSuper(methodName: string, ...args: unknown[]): any;
    getBoundingRect(absolute?: boolean, calculate?: boolean): Rect;
    on(eventName: EventNameExt, handler: (e: IEvent<MouseEvent>) => void): void;
    off(eventName: EventNameExt, handler?: (e: IEvent<MouseEvent>) => void): void;
    fire<T>(eventName: EventNameExt, options?: any): T;
    isPointOnRuler(e: MouseEvent): 'horizontal' | 'vertical' | false;
    bringToFront(): fabric.FabricObject;
    isHorizontal(): boolean;
  }

  export interface GuideLine extends Line, IGuideLineClassOptions {}

  export class GuideLine extends Line {
    constructor(xy: number, objObjects?: IGuideLineOptions);
    static fromObject(object: any, callback: any): void;
  }

  export interface StaticCanvas {
    ruler: InstanceType<typeof CanvasRuler>;
  }
}
