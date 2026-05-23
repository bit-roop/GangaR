type TooltipPoint = {
  x?: number;
  y?: number;
};

type TooltipViewBox = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

type TooltipPositionOptions = {
  coordinate?: TooltipPoint;
  viewBox?: TooltipViewBox;
  width: number;
  height: number;
  padding?: number;
  gap?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getBoundedTooltipOffset({
  coordinate,
  viewBox,
  width,
  height,
  padding = 8,
  gap = 12
}: TooltipPositionOptions) {
  const cursorX = coordinate?.x ?? 0;
  const cursorY = coordinate?.y ?? 0;
  const viewX = viewBox?.x ?? 0;
  const viewY = viewBox?.y ?? 0;
  const viewWidth = viewBox?.width ?? width + padding * 2;
  const viewHeight = viewBox?.height ?? height + padding * 2;
  const minX = viewX + padding;
  const maxX = Math.max(minX, viewX + viewWidth - width - padding);
  const minY = viewY + padding;
  const maxY = Math.max(minY, viewY + viewHeight - height - padding);
  const preferLeft = cursorX - viewX > viewWidth / 2;
  const preferredX = preferLeft ? cursorX - width - gap : cursorX + gap;
  const preferredY = cursorY - height / 2;
  const absoluteX = clamp(preferredX, minX, maxX);
  const absoluteY = clamp(preferredY, minY, maxY);

  return {
    left: absoluteX - cursorX,
    top: absoluteY - cursorY,
    edgeX: preferLeft ? "edge-left" : "edge-right",
    edgeY: absoluteY > cursorY ? "edge-down" : "edge-up"
  };
}
