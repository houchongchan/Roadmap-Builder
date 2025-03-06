import { RouterOutlet } from '@angular/router';
import {
  AfterViewInit,
  Component,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { CanvasComponent } from './canvas/canvas.component';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LadderInputComponent } from './ladder-input/ladder-input.component';

@Component({
  selector: 'app-root',
  standalone: true, // Mark the component as standalone
  imports: [
    RouterOutlet,
    CanvasComponent,
    LadderInputComponent,
    FormsModule, // Ensure FormsModule is imported here
    CommonModule,
  ],
  template: `
    <main class="main">
      <div class="content" *ngIf="topRowDescriptions.length > 0">
        <header class="fade-content">
          <a href="https://github.com/houchongchan"
            >Japanese Ladder: Decision Making Minigame</a
          >
        </header>
        <div class="container-body">
          <div class="flex-row space-around">
            <div
              class="even-columns"
              *ngFor="let l of [].constructor(lineCount); let index = index"
            >
              <div>
                <button
                  class="animation-button"
                  [disabled]="isButtonDisabled(index)"
                  (click)="triggerChildStartDrawing(index)"
                >
                  <span>
                    <svg
                      width="20px"
                      height="20px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        <path
                          d="M12 6V18M12 18L7 13M12 18L17 13"
                          stroke="#faf"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                      </g>
                    </svg>
                  </span>
                </button>
              </div>
              <app-ladder-input
                [lines]="lineCount"
                [onDescriptionChange]="onDescriptionChange"
                [index]="index"
                [row]="'top'"
                [brightColor]="brightColor"
                [isButtonDisabled]="isButtonDisabled(index)"
              />
            </div>
          </div>
          <app-canvas
            class="parent-canvas-component"
            [lines]="lineCount"
            [brightColor]="brightColor"
            (notify)="onNumberReceived($event)"
          />
          <div class="flex-row space-around">
            <div
              class="even-columns"
              *ngFor="let l of [].constructor(lineCount); let index = index"
            >
              <app-ladder-input
                [lines]="lineCount"
                [onDescriptionChange]="onDescriptionChange"
                [index]="index"
                [row]="'bottom'"
                [brightColor]="brightColor"
                [isButtonDisabled]="isDecisionReached(index)"
              />
            </div>
          </div>
          <div class="flex-row toolbar">
            <div class="slider-control">
              Current Tree Count:
              <span>{{ lineCount }}</span>
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                [(ngModel)]="lineCount"
                (input)="onInputChange($event)"
                class="slider"
              />
            </div>
            <button class="reset-button" (click)="reset()">
              <span>Click</span> <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </main>
    <router-outlet />
  `,
  styleUrls: ['./app.component.scss', '../styles.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild(CanvasComponent, { static: false })
  childCanvasComponent!: CanvasComponent;

  @ViewChildren(LadderInputComponent)
  childInputs!: QueryList<LadderInputComponent>;
  brightColor: string = '';

  lineCount: number = 4;
  topRowDescriptions: string[] = Array(this.lineCount).fill('');
  bottomRowDescriptions: string[] = Array(this.lineCount).fill('');
  clickedButtons: Set<number> = new Set();
  reachedDecisions: Set<number> = new Set();

  ngAfterViewInit(): void {
    // Ensure that child components are initialized
    console.log('Canvas component is rendered');
  }

  constructor() {
    this.autofillTopRowDescriptions();
  }

  autofillTopRowDescriptions(): void {
    for (let i = 0; i < this.lineCount; i++) {
      this.topRowDescriptions[i] = '';
      this.bottomRowDescriptions[i] = '';
    }
  }

  onInputChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    this.lineCount = Number(target.value);
  };

  onDescriptionChange = (event: Event, index: number, row: string): void => {
    const target = event.target as HTMLInputElement;
    if (row === 'top') {
      this.topRowDescriptions[index] = target.value;
    } else {
      this.bottomRowDescriptions[index] = target.value;
    }
  };

  triggerChildStartDrawing(index: number): void {
    this.brightColor = this.getBrightColor();
    this.clickedButtons.add(index);
    if (this.childCanvasComponent) {
      this.childCanvasComponent.startDrawing(index, this.brightColor);
    } else {
      console.log('startDrawing method is not available in the child');
    }
  }

  isButtonDisabled(index: number): boolean {
    return this.clickedButtons.has(index);
  }

  isDecisionReached(index: number): boolean {
    return this.reachedDecisions.has(index);
  }

  reset(): void {
    console.log('reset');
    this.clickedButtons.clear();
    this.reachedDecisions.clear();
    this.childInputs.forEach((child) => child.reset()); // Call reset on each child component
    if (this.childCanvasComponent) {
      this.childCanvasComponent.resizeCanvas();
    }
  }

  onNumberReceived(index: number): void {
    this.reachedDecisions.add(index);
  }

  getBrightColor(): string {
    let hue;
    do {
      hue = Math.floor(Math.random() * 360); // Random hue from 0-360°
    } while (hue >= 270 && hue <= 330); // Exclude 270-330° (purple-pink)
    const saturation = Math.floor(Math.random() * 21) + 80; // 80-100% saturation
    const lightness = Math.floor(Math.random() * 21) + 60; // 60-80% lightness
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
}
