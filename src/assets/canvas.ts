import { ElementRef } from '@angular/core';

export function defaultCanvasContext(
  context: CanvasRenderingContext2D,
  canvas: ElementRef<HTMLCanvasElement>
) {
  context.clearRect(
    0,
    0,
    canvas.nativeElement.width,
    canvas.nativeElement.height
  );
  // Now you can use context to draw on the canvas
  context.lineWidth = 5; // Default line width
  context.shadowBlur = 3;
  context.shadowColor = 'blue';
  context.strokeStyle = '#18a999'; // Default stroke color
  context.lineCap = 'round';
  context.lineJoin = 'round';
}

export function pathTraversalContext(
  context: CanvasRenderingContext2D,
  brightColor: string
) {
  context.strokeStyle = brightColor;
  context.shadowBlur = 1;
  context.shadowColor = 'black';
  context.lineWidth = 5; // Default line width
}

export function getBrightColor() {
  let hue: number;
  do {
    hue = Math.floor(Math.random() * 360); // Random hue from 0-360°
  } while (hue >= 270 && hue <= 330); // Exclude 270-330° (purple-pink)
  const saturation = Math.floor(Math.random() * 21) + 80; // 80-100% saturation
  const lightness = Math.floor(Math.random() * 21) + 60; // 60-80% lightness
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function mouseDownChecker(
  pos,
  segments,
  verticalMargin,
  canvasHeight,
  hasPairingStarted
) {
  const withinMargin = segments - (pos.x % segments);
  if (withinMargin < 90 && withinMargin > 10) return false;

  if (
    verticalMargin * 1.5 > pos.y ||
    pos.y > canvasHeight - verticalMargin * 1.5 ||
    hasPairingStarted
  )
    return false;
}

export function mouseUpChecker(
  pos,
  segments,
  verticalMargin,
  canvasHeight,
  canvasWidth,
  startX
) {
  const withinMargin = segments - (pos.x % segments);
  const endX = Math.round(pos.x / segments) * segments;
  if ((withinMargin < 90 && withinMargin > 10) || endX == startX)
    // point cannot be on the line itself
    return false;

  if (Math.abs(pos.x - this.startX) > this.segments * 1.05)
    // point cannot pass a segment itself
    return false;

  if (
    verticalMargin * 1.5 > pos.y ||
    pos.y > canvasHeight - verticalMargin * 1.5 ||
    verticalMargin * 1.5 > pos.x ||
    pos.x > canvasWidth - verticalMargin * 1.5
  )
    return false;
}
