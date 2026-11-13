
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-planet',
  imports: [],
  templateUrl: './planet.html',
  styleUrl: './planet.scss'
})
export class Planet {
  @Input() name = 'Nuevo hábito';
  @Input() emoji = '🪐';
  @Input() color = '#C9B6E4';
}
