import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pairing',
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="transition-container">
        <div
          class="input-container"
          [ngStyle]="{
          'background-color': pairing.color,
        }"
        >
          <span class="input-label">
            {{ pairing.start + 1 }}
          </span>
          {{ pairing.startText || 'N/A' }}
        </div>
        <div class="connecting-line"></div>
        <div
          class="input-container"
          [ngStyle]="{
          'background-color': pairing.color,
        }"
        >
          <span class="input-label">
            {{ pairing.end + 1 }}
          </span>
          {{ pairing.endText || 'N/A' }}
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./pairing.component.scss', '../../styles.scss'],
})
export class PairingComponent {
  @Input pairing: {
    start: number;
    end: number;
    startText: string;
    endText: string;
    color: string;
  };
  renderInPlace: boolean = false;
}
