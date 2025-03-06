import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-canvas',
  imports: [],
  template: '<canvas #myCanvas>',
  styleUrl: './canvas.component.scss',
})
export class CanvasComponent implements AfterViewInit, OnChanges {
  @ViewChild('myCanvas', { static: false })
  canvas: ElementRef<HTMLCanvasElement>;
  @Input lines;
  @Input brightColor;
  @Output() notify: EventEmitter<number> = new EventEmitter<number>(); // Declare EventEmitter

  private ctx: CanvasRenderingContext2D;
  private drawing = false;
  point_size = 10;
  private startX = 0;
  private startY = 0;

  private savedImageData!: ImageData; // Stores previous canvas state
  private constraints = [];
  private animationIndex = 0;
  private progress = 0; // Controls smooth rendering of each segment
  private animationSpeed = 0.02; // Adjust speed (lower = slower)
  private animationStartPoint: { x: number; y: number };
  private animationEndPoint: { x: number; y: number };
  private visitedConstraints = new Set();
  private verticalMargin: number = 20;
  segments;

  ngAfterViewInit(): void {
    this.resizeCanvas();
    this.segments = this.canvas.nativeElement.width / (this.lines + 1);
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.ctx.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
    // Now you can use this.ctx to draw on the canvas
    this.ctx.lineWidth = 5; // Default line width
    this.ctx.shadowBlur = 3;
    this.ctx.shadowColor = 'blue';
    this.ctx.strokeStyle = '#18a999'; // Default stroke color
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    for (let i = 0; i < this.lines; i++) {
      this.drawLine(
        (i + 1) * this.segments,
        this.verticalMargin,
        this.canvas.nativeElement.height - this.verticalMargin * 2
      );
    }
    this.savedImageData = this.ctx!.getImageData(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );

    if (!this.ctx) {
      console.error('Unable to get 2D context.');
      return;
    }

    const canvasEl = this.canvas.nativeElement;
    // Attach event listeners directly to the canvas
    canvasEl.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvasEl.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvasEl.addEventListener('mouseup', this.onMouseUp.bind(this));
    canvasEl.addEventListener('mouseleave', this.onMouseLeave.bind(this));
  }

  public resizeCanvas(): void {
    const canvasEl = this.canvas.nativeElement;
    const parent = canvasEl.parentElement;

    if (parent) {
      canvasEl.width = parent.clientWidth;
      canvasEl.height = window.innerHeight / 2; // Set the resolution height
      this.respaceLineSegments();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lines'] && this.canvas) {
      this.respaceLineSegments();
    }
  }

  respaceLineSegments() {
    this.segments = this.canvas.nativeElement.width / (this.lines + 1);
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.ctx.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
    // Now you can use this.ctx to draw on the canvas
    this.ctx.lineWidth = 5; // Default line width
    this.ctx.shadowBlur = 3;
    this.ctx.shadowColor = 'blue';
    this.ctx.strokeStyle = '#18a999'; // Default stroke color
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    for (let i = 0; i < this.lines; i++) {
      this.drawLine(
        (i + 1) * this.segments,
        this.verticalMargin,
        this.canvas.nativeElement.height - this.verticalMargin * 2
      );
    }
    this.savedImageData = this.ctx!.getImageData(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
  }

  private getMousePos(event: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  onMouseDown(event: MouseEvent) {
    const pos = this.getMousePos(event);
    // calculate if the point is within margin
    const withinMargin = this.segments - (pos.x % this.segments);
    if (withinMargin < 90 && withinMargin > 10) return;

    this.drawing = true;
    this.startX = Math.round(pos.x / this.segments) * this.segments;
    this.startY = pos.y;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.drawing || !this.ctx) return;
    this.ctx.strokeStyle = '#18a999'; // Default stroke color
    const pos = this.getMousePos(event);
    this.ctx.putImageData(this.savedImageData, 0, 0);
    this.ctx.beginPath();
    this.ctx.moveTo(this.startX, this.startY);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
  }

  onMouseUp(event: MouseEvent) {
    if (!this.drawing || !this.ctx) return;
    this.drawing = false;
    const pos = this.getMousePos(event);
    const withinMargin = this.segments - (pos.x % this.segments);
    const endX = Math.round(pos.x / this.segments) * this.segments;
    if ((withinMargin < 90 && withinMargin > 10) || endX == this.startX)
      // point cannot be on the line itself
      return this.ctx.putImageData(this.savedImageData, 0, 0);

    const endY =
      pos.y + ((pos.y - this.startY) / (pos.x - this.startX)) * (endX - pos.x);
    this.ctx.putImageData(this.savedImageData, 0, 0);
    this.ctx.beginPath();
    this.ctx.moveTo(this.startX, this.startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
    this.ctx?.closePath();

    const data = {
      start:
        this.startX < endX
          ? { x: this.startX, y: this.startY }
          : { x: endX, y: endY },
      end:
        this.startX > endX
          ? { x: this.startX, y: this.startY }
          : { x: endX, y: endY },
    };

    this.constraints.push(data);

    this.savedImageData = this.ctx!.getImageData(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
  }

  // Stop drawing if the mouse leaves the canvas
  onMouseLeave() {
    this.drawing = false;
  }

  drawCircle(x, y) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.point_size * 2, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.point_size, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ad72ba';
    this.ctx.fill();
  }

  drawLine(x, y, length) {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x, y + length);
    this.ctx.stroke();
    this.drawCircle(x, y);
    this.drawCircle(x, y + length);
  }

  public startDrawing(index, brightColor) {
    this.animationIndex = 0;
    const lineX = this.segments * (index + 1);
    this.animationStartPoint = { x: lineX, y: this.verticalMargin };
    this.animationEndPoint = this.findNextPoint({
      x: lineX,
      y: this.verticalMargin,
    });

    this.ctx.strokeStyle = brightColor;
    this.ctx.shadowBlur = 1;
    this.ctx.shadowColor = 'black';
    this.ctx.lineWidth = 5; // Default line width
    this.animatePath();
  }

  animatePath() {
    if (!this.ctx) return;

    const start = this.animationStartPoint;
    const end = this.animationEndPoint;

    // Interpolate between start and end points for smooth drawing
    const currentX = start.x + (end.x - start.x) * this.progress;
    const currentY = start.y + (end.y - start.y) * this.progress;

    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(currentX, currentY);
    this.ctx.stroke();

    // Increment progress towards the next point
    this.progress += this.animationSpeed;

    if (this.progress >= 1) {
      // Move to the next segment when progress is complete
      this.progress = 0;
      this.animationIndex++;
      this.animationStartPoint = this.animationEndPoint;
      this.animationEndPoint = this.findNextPoint(this.animationStartPoint);
      // first, find all the constraints on that line, and traverse through that constraint when it's reached.
    }

    // break if ending elevation is reached
    if (this.animationEndPoint.y == this.animationStartPoint.y) {
      this.visitedConstraints = new Set();
      this.notify.emit(
        Math.round(this.animationStartPoint.x / this.segments) - 1
      ); // Emit event with data
      return (this.savedImageData = this.ctx!.getImageData(
        0,
        0,
        this.canvas.nativeElement.width,
        this.canvas.nativeElement.height
      ));
    }

    requestAnimationFrame(() => this.animatePath());
  }

  findNextPoint(startPos) {
    const filteredConstraints = this.constraints
      .filter(
        (e) =>
          ((e.start.x == startPos.x && e.start.y >= startPos.y) ||
            (e.end.x == startPos.x && e.end.y >= startPos.y)) &&
          !this.visitedConstraints.has(e) &&
          (e.start.y >= startPos.y || e.end.y >= startPos.y)
      )
      .sort(
        (a, b) =>
          (a.start.x == startPos.x ? a.start.y : a.end.y) -
          (b.start.x == startPos.x ? b.start.y : b.end.y)
      );

    if (filteredConstraints.length > 0) {
      if (
        startPos.x == filteredConstraints[0].start.x &&
        startPos.y == filteredConstraints[0].start.y
      ) {
        this.visitedConstraints.add(filteredConstraints[0]);
        return filteredConstraints[0].end;
      }
      if (
        startPos.x == filteredConstraints[0].end.x &&
        startPos.y == filteredConstraints[0].end.y
      ) {
        this.visitedConstraints.add(filteredConstraints[0]);
        return filteredConstraints[0].start;
      }

      console.log('dfsfs');

      return {
        x: startPos.x,
        y:
          startPos.x == filteredConstraints[0].start.x
            ? filteredConstraints[0].start.y
            : filteredConstraints[0].end.y,
      };
      // return filteredConstraints[0].
    } else {
      return {
        x: startPos.x,
        y: this.canvas.nativeElement.height - this.verticalMargin,
      };
    }
  }
}
