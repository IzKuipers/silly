/**
 * UNDOCUMENTED -- Copied from the Neodrag codebase.
 *
 * https://github.com/PuruVJ/neodrag
 */

// ../core/dist/index.js
let DEFAULT_RECOMPUTE_BOUNDS = {
  dragStart: true,
};
let draggable = (node, options = {}) => {
  let {
    bounds,
    axis = "both",
    gpuAcceleration = true,
    legacyTranslate = true,
    transform,
    applyUserSelectHack = true,
    disabled = false,
    ignoreMultitouch = false,
    recomputeBounds = DEFAULT_RECOMPUTE_BOUNDS,
    grid,
    position,
    cancel,
    handle,
    defaultClass = "neodrag",
    defaultClassDragging = "neodrag-dragging",
    defaultClassDragged = "neodrag-dragged",
    defaultPosition = { x: 0, y: 0 },
    onDragStart,
    onDrag,
    onDragEnd,
  } = options;
  let active = false;
  let translateX = 0,
    translateY = 0;
  let initialX = 0,
    initialY = 0;
  let clientToNodeOffsetX = 0,
    clientToNodeOffsetY = 0;
  let { x: xOffset, y: yOffset } = position
    ? { x: position?.x ?? 0, y: position?.y ?? 0 }
    : defaultPosition;
  setTranslate(xOffset, yOffset);
  let canMoveInX;
  let canMoveInY;
  let bodyOriginalUserSelectVal = "";
  let computedBounds;
  let nodeRect;
  let dragEls;
  let cancelEls;
  let isControlled = !!position;
  recomputeBounds = { ...DEFAULT_RECOMPUTE_BOUNDS, ...recomputeBounds };
  let activePointers = /* @__PURE__ */ new Set();
  const bodyStyle = document.body.style;
  const nodeClassList = node.classList;
  function setTranslate(xPos = translateX, yPos = translateY) {
    if (!transform) {
      if (legacyTranslate) {
        let common = `${+xPos}px, ${+yPos}px`;
        return setStyle(
          node,
          "transform",
          gpuAcceleration ? `translate3d(${common}, 0)` : `translate(${common})`
        );
      }
      return setStyle(
        node,
        "translate",
        `${+xPos}px ${+yPos}px ${gpuAcceleration ? "1px" : ""}`
      );
    }
    const transformCalled = transform({
      offsetX: xPos,
      offsetY: yPos,
      rootNode: node,
    });
    if (isString(transformCalled)) {
      setStyle(node, "transform", transformCalled);
    }
  }
  const listen = addEventListener;
  listen("pointerdown", dragStart, false);
  listen("pointerup", dragEnd, false);
  listen("pointermove", drag, false);
  setStyle(node, "touch-action", "none");
  const calculateInverseScale = () => {
    let inverseScale = node.offsetWidth / nodeRect.width;
    if (isNaN(inverseScale)) inverseScale = 1;
    return inverseScale;
  };
  function dragStart(e) {
    if (disabled) return;
    if (e.button === 2) return;
    activePointers.add(e.pointerId);
    if (ignoreMultitouch && activePointers.size > 1) return e.preventDefault();
    if (recomputeBounds.dragStart)
      computedBounds = computeBoundRect(bounds, node);
    if (isString(handle) && isString(cancel) && handle === cancel)
      throw new Error("`handle` selector can't be same as `cancel` selector");
    nodeClassList.add(defaultClass);
    dragEls = getHandleEls(handle, node);
    cancelEls = getCancelElements(cancel, node);
    canMoveInX = /(both|x)/.test(axis);
    canMoveInY = /(both|y)/.test(axis);
    if (cancelElementContains(cancelEls, dragEls))
      throw new Error(
        "Element being dragged can't be a child of the element on which `cancel` is applied"
      );
    const eventTarget = e.composedPath()[0];
    if (
      dragEls.some(
        (el) => el.contains(eventTarget) || el.shadowRoot?.contains(eventTarget)
      ) &&
      !cancelElementContains(cancelEls, [eventTarget])
    ) {
      active = true;
    } else return;
    nodeRect = node.getBoundingClientRect();
    if (applyUserSelectHack) {
      bodyOriginalUserSelectVal = bodyStyle.userSelect;
      bodyStyle.userSelect = "none";
    }
    const { clientX, clientY } = e;
    const inverseScale = calculateInverseScale();
    if (canMoveInX) initialX = clientX - xOffset / inverseScale;
    if (canMoveInY) initialY = clientY - yOffset / inverseScale;
    if (computedBounds) {
      clientToNodeOffsetX = clientX - nodeRect.left;
      clientToNodeOffsetY = clientY - nodeRect.top;
    }
  }
  function dragEnd(e) {
    activePointers.delete(e.pointerId);
    if (!active) return;
    if (recomputeBounds.dragEnd)
      computedBounds = computeBoundRect(bounds, node);
    nodeClassList.remove(defaultClassDragging);
    nodeClassList.add(defaultClassDragged);
    if (applyUserSelectHack) bodyStyle.userSelect = bodyOriginalUserSelectVal;
    if (canMoveInX) initialX = translateX;
    if (canMoveInY) initialY = translateY;
    active = false;
  }
  function drag(e) {
    if (!active || (ignoreMultitouch && activePointers.size > 1)) return;
    if (recomputeBounds.drag) computedBounds = computeBoundRect(bounds, node);
    nodeClassList.add(defaultClassDragging);
    e.preventDefault();
    nodeRect = node.getBoundingClientRect();
    let finalX = e.clientX,
      finalY = e.clientY;
    const inverseScale = calculateInverseScale();
    if (computedBounds) {
      const virtualClientBounds = {
        left: computedBounds.left + clientToNodeOffsetX,
        top: computedBounds.top + clientToNodeOffsetY,
        right: computedBounds.right + clientToNodeOffsetX - nodeRect.width,
        bottom: computedBounds.bottom + clientToNodeOffsetY - nodeRect.height,
      };
      finalX = clamp(
        finalX,
        virtualClientBounds.left,
        virtualClientBounds.right
      );
      finalY = clamp(
        finalY,
        virtualClientBounds.top,
        virtualClientBounds.bottom
      );
    }
    if (Array.isArray(grid)) {
      let [xSnap, ySnap] = grid;
      if (isNaN(+xSnap) || xSnap < 0)
        throw new Error(
          "1st argument of `grid` must be a valid positive number"
        );
      if (isNaN(+ySnap) || ySnap < 0)
        throw new Error(
          "2nd argument of `grid` must be a valid positive number"
        );
      let deltaX = finalX - initialX,
        deltaY = finalY - initialY;
      [deltaX, deltaY] = snapToGrid(
        [xSnap / inverseScale, ySnap / inverseScale],
        deltaX,
        deltaY
      );
      finalX = initialX + deltaX;
      finalY = initialY + deltaY;
    }
    if (canMoveInX) translateX = Math.round((finalX - initialX) * inverseScale);
    if (canMoveInY) translateY = Math.round((finalY - initialY) * inverseScale);
    xOffset = translateX;
    yOffset = translateY;
    setTranslate();
  }
  return {
    destroy: () => {
      const unlisten = removeEventListener;
      unlisten("pointerdown", dragStart, false);
      unlisten("pointerup", dragEnd, false);
      unlisten("pointermove", drag, false);
    },
    update: (options2) => {
      axis = options2.axis || "both";
      disabled = options2.disabled ?? false;
      ignoreMultitouch = options2.ignoreMultitouch ?? false;
      handle = options2.handle;
      bounds = options2.bounds;
      recomputeBounds = options2.recomputeBounds ?? DEFAULT_RECOMPUTE_BOUNDS;
      cancel = options2.cancel;
      applyUserSelectHack = options2.applyUserSelectHack ?? true;
      grid = options2.grid;
      gpuAcceleration = options2.gpuAcceleration ?? true;
      legacyTranslate = options2.legacyTranslate ?? true;
      transform = options2.transform;
      const dragged = nodeClassList.contains(defaultClassDragged);
      nodeClassList.remove(defaultClass, defaultClassDragged);
      defaultClass = options2.defaultClass ?? "neodrag";
      defaultClassDragging =
        options2.defaultClassDragging ?? "neodrag-dragging";
      defaultClassDragged = options2.defaultClassDragged ?? "neodrag-dragged";
      nodeClassList.add(defaultClass);
      if (dragged) nodeClassList.add(defaultClassDragged);
      if (isControlled) {
        xOffset = translateX = options2.position?.x ?? translateX;
        yOffset = translateY = options2.position?.y ?? translateY;
        setTranslate();
      }
    },
  };
};
let clamp = (val, min, max) => Math.min(Math.max(val, min), max);
let isString = (val) => typeof val === "string";
let snapToGrid = ([xSnap, ySnap], pendingX, pendingY) => {
  const calc = (val, snap) => (snap === 0 ? 0 : Math.ceil(val / snap) * snap);
  const x = calc(pendingX, xSnap);
  const y = calc(pendingY, ySnap);
  return [x, y];
};
function getHandleEls(handle, node) {
  if (!handle) return [node];
  if (isHTMLElement(handle)) return [handle];
  if (Array.isArray(handle)) return handle;
  const handleEls = node.querySelectorAll(handle);
  if (handleEls === null)
    throw new Error(
      "Selector passed for `handle` option should be child of the element on which the action is applied"
    );
  return Array.from(handleEls.values());
}
function getCancelElements(cancel, node) {
  if (!cancel) return [];
  if (isHTMLElement(cancel)) return [cancel];
  if (Array.isArray(cancel)) return cancel;
  const cancelEls = node.querySelectorAll(cancel);
  if (cancelEls === null)
    throw new Error(
      "Selector passed for `cancel` option should be child of the element on which the action is applied"
    );
  return Array.from(cancelEls.values());
}
let cancelElementContains = (cancelElements, dragElements) =>
  cancelElements.some((cancelEl) =>
    dragElements.some((el) => cancelEl.contains(el))
  );
function computeBoundRect(bounds, rootNode) {
  if (bounds === void 0) return;
  if (isHTMLElement(bounds)) return bounds.getBoundingClientRect();
  if (typeof bounds === "object") {
    const { top = 0, left = 0, right = 0, bottom = 0 } = bounds;
    const computedRight = window.innerWidth - right;
    const computedBottom = window.innerHeight - bottom;
    return { top, right: computedRight, bottom: computedBottom, left };
  }
  if (bounds === "parent") return rootNode.parentNode.getBoundingClientRect();
  const node = document.querySelector(bounds);
  if (node === null)
    throw new Error(
      "The selector provided for bound doesn't exists in the document."
    );
  return node.getBoundingClientRect();
}
let setStyle = (el, style, value) => el.style.setProperty(style, value);
let isHTMLElement = (obj) => obj instanceof HTMLElement;

// src/index.ts
export let Draggable = class {
  constructor(node, options = {}) {
    this.node = node;
    this._dragInstance = draggable(node, (this._options = options));
  }
  _dragInstance;
  _options = {};
  updateOptions(options) {
    this._dragInstance.update(Object.assign(this._options, options));
  }
  set options(options) {
    this._dragInstance.update((this._options = options));
  }
  get options() {
    return this._options;
  }
  destroy() {
    this._dragInstance.destroy();
  }
};
