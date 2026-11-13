
import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Mission } from '../../core/models/mission';

@Component({
  selector: 'app-mission-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './mission-form.html',
  styleUrl: './mission-form.scss'
})
export class MissionForm implements OnChanges {

  @Input() mission: Mission | null = null;

  @Output() save = new EventEmitter<Mission>();
  @Output() cancel = new EventEmitter<void>();

  name = '';
  description = '';
  selectedColor = '#C9B6E4';

  colors = [
    { value: '#C9B6E4', label: 'Morado' },
    { value: '#FF806B', label: 'Coral' },
    { value: '#FFD166', label: 'Amarillo' },
    { value: '#A8DDB5', label: 'Verde' },
    { value: '#A9D5ED', label: 'Azul' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mission'] && this.mission) {
      this.name = this.mission.name;
      this.description = this.mission.description ?? '';
      this.selectedColor = this.mission.color;
    }
  }

  onSubmit(): void {
    const missionName = this.name.trim();

    if (!missionName) {
      return;
    }

    const updatedMission: Mission = {
      id: this.mission?.id ?? crypto.randomUUID(),
      name: missionName,
      description: this.description.trim(),
      color: this.selectedColor,
      habitIds: this.mission?.habitIds ?? [],
      shipType: this.mission?.shipType ?? Math.floor(Math.random() * 5) + 1,
      createdAt: this.mission?.createdAt ?? new Date().toISOString()
    };

    this.save.emit(updatedMission);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}

