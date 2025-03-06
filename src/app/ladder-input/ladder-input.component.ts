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
    <div class="container">
      <div class="input-label">{{ index + 1 }}</div>
      <input
        class="text-input"
        type="text"
        (input)="onDescriptionChange($event, index, row)"
        [disabled]="isButtonDisabled"
        [ngStyle]="{
          'background-color': inputColor,
          'box-shadow': 'inset 0 0 0 0.125rem ' + inputColor
        }"
        placeholder="Selection"
        [(ngModel)]="inputValue"
      />
    </div>
  `,
  styleUrls: ['./ladder-input.component.scss'],
})
export class LadderInputComponent implements AfterViewInit {
  @Input() onDescriptionChange: (
    event: Event,
    index: number,
    row: string
  ) => void = () => {};
  @Input() disabled: boolean = false;
  @Input() index: number = 0;
  @Input() row: string = '';
  @Input() isButtonDisabled: boolean = false;

  @Input() inputValue: string = '';
  @Output() inputValueChange = new EventEmitter<string>();
  @Input() brightColor: string;
  inputColor: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isButtonDisabled']) {
      if (!this.isButtonDisabled) {
        this.inputColor = '#fff';
        return;
      }
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

  getInputText(row) {
    if (row == 'top') {
      return 'Selcti';
    }
    return 'Selection';
  }
}
