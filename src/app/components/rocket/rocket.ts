
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-rocket',
  imports: [],
  templateUrl: './rocket.html',
  styleUrl: './rocket.scss'
})
export class Rocket {
  @Input() progress = 0;
  @Input() label = 'Progreso de la misión';
}

