import { RouterOutlet } from '@angular/router';
import {
  AfterViewInit,
  Component,
  HostListener,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { CanvasComponent } from './canvas/canvas.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LadderInputComponent } from './ladder-input/ladder-input.component';
import { getBrightColor } from '../assets/canvas';
import { ExplanationComponent } from './explanation/explanation.component';
import { PairingComponent } from './pairing/pairing.component';

@Component({
  selector: 'app-root',
  standalone: true, // Mark the component as standalone
  imports: [
    RouterOutlet,
    CanvasComponent,
    LadderInputComponent,
    ExplanationComponent,
    PairingComponent,
    FormsModule, // Ensure FormsModule is imported here
    CommonModule,
  ],
  template: `
    <main class="main">
      <div class="content" *ngIf="topRowDescriptions.length > 0">
        <header class="fade-content">
          <a href="https://github.com/houchongchan"
            >Ghost Leg: Selection Randomizer</a
          >
          <div class="question-icon" (click)="setShowQuestion()">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 320 512"
              height="24px"
            >
              <path
                d="M80 160c0-35.3 28.7-64 64-64l32 0c35.3 0 64 28.7 64 64l0 3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74l0 1.4c0 17.7 14.3 32 32 32s32-14.3 32-32l0-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7l0-3.6c0-70.7-57.3-128-128-128l-32 0C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"
                fill="var(--ssecondary-1)"
              />
            </svg>
          </div>
        </header>
        <div class="container-body">
          <app-explanation [showQuestion]="showQuestion" />
          <div class="flex-row space-around">
            <div
              class="even-columns"
              *ngFor="let l of [].constructor(lineCount); let index = index"
            >
              <div>
                <button
                  class="animation-button"
                  [disabled]="isButtonDisabled(index) || running"
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
                      <g stroke-width="0"></g>
                      <g stroke-linecap="round" stroke-linejoin="round"></g>
                      <g>
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
            [hasPairingStarted]="hasPairingStarted()"
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
      <div
        class="pairings-container"
        *ngFor="let l of decisionsArray; let index = index"
      >
        <app-pairing [pairing]="pairings[index]" />
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
  showQuestion: boolean = false;

  lineCount: number = 4;
  topRowDescriptions: string[] = Array(this.lineCount).fill('');
  bottomRowDescriptions: string[] = Array(this.lineCount).fill('');
  clickedButtons: Set<number> = new Set();
  reachedDecisions: Set<number> = new Set();
  pairings: {
    start: number;
    end: number;
    startText: string;
    endText: string;
    color: string;
  }[] = [];
  running: boolean = false;
  startedIndex: number;

  ngAfterViewInit(): void {
    // Ensure that child components are initialized
    console.log('Canvas component is rendered');
  }

  constructor() {
    //autofill Top Row Descriptions;
    for (let i = 0; i < this.lineCount; i++) {
      this.topRowDescriptions[i] = '';
      this.bottomRowDescriptions[i] = '';
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.reset();
  }

  onInputChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    this.reset();
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
    this.brightColor = getBrightColor();
    this.running = true;
    this.clickedButtons.add(index);
    this.startedIndex = index;
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

  hasPairingStarted() {
    return this.clickedButtons.size > 0;
  }

  reset(): void {
    this.clickedButtons.clear();
    this.reachedDecisions.clear();
    this.pairings = [];
    this.childInputs.forEach((child) => child.reset()); // Call reset on each child component
    if (this.childCanvasComponent) {
      this.childCanvasComponent.resizeCanvas();
    }
  }

  onNumberReceived(index: number): void {
    this.running = false;

    const inputsArray = this.childInputs.toArray();

    const startText = inputsArray[index].inputText; // Call reset on each child component
    const endText = inputsArray[this.lineCount + index].inputText; // Call reset on each child component
    this.pairings.push({
      start: this.startedIndex,
      end: index,
      startText,
      endText,
      color: this.brightColor,
    });

    this.startedIndex = undefined;
    this.reachedDecisions.add(index);
  }

  get decisionsArray(): number[] {
    return [...this.reachedDecisions]; // or use Array.from(this.reachedDecisions)
  }

  setShowQuestion(): void {
    this.showQuestion = !this.showQuestion;
  }
}
