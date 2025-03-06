import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ladder-input',
  imports: [CommonModule, FormsModule],
  template: `
    <input
      class="text-input"
      type="text"
      (input)="onDescriptionChange($event, index, row)"
      [disabled]="isButtonDisabled"
      [ngClass]="{ 'rendered-decision': isButtonDisabled }"
      [ngStyle]="{
        'background-color': inputColor,
        'box-shadow': 'inset 0 0 0 0.125rem ' + inputColor
      }"
      [(ngModel)]="inputValue"
    />
  `,
  styleUrls: ['./ladder-input.component.scss'], // Corrected to styleUrls
})
export class LadderInputComponent implements AfterViewInit {
  // Explicit typing for all inputs
  @Input() onDescriptionChange: (
    event: Event,
    index: number,
    row: string
  ) => void = () => {};
  @Input() disabled: boolean = false;
  @Input() index: number = 0;
  @Input() row: string = '';
  @Input() isButtonDisabled: boolean = false;

  // Input value with a string type
  @Input() inputValue: string = '';
  @Output() inputValueChange = new EventEmitter<string>();
  @Input() brightColor: string;
  inputColor;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isButtonDisabled']) {
      if (!this.isButtonDisabled) {
        this.inputColor = '#fff';
        return;
      }
      console.log(this.inputColor, this.brightColor);
      this.inputColor = this.brightColor;
    }
  }

  ngAfterViewInit(): void {
    // No changes needed here for now
  }

  // Reset method to clear the input value and emit the change
  reset(): void {
    this.inputValue = ''; // Reset input value
    this.inputValueChange.emit(this.inputValue); // Emit the updated value
  }
}
