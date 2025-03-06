import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-explanation',
  imports: [CommonModule],
  template: `<div class="container" [ngClass]="{ visible: showQuestion }">
    Ghost Leg is commonly used in Asia to assign random pairings between
    selections. The diagrams is initialized with only vertical lines. The user
    can connect vertical lines to one another. The pairings are then made via
    path traversal down the connected lines. A common use case is the assignment
    of tasks to people.
  </div>`,
  styleUrl: './explanation.component.scss',
})
export class ExplanationComponent {
  @Input() showQuestion: boolean = false;
}
