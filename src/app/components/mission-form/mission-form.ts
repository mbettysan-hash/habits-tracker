
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Mission } from '../../core/models/mission';

@Component({
  selector: 'app-mission-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './mission-form.html',
  styleUrl: './mission-form.scss'
})
export class MissionForm {

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

  onSubmit(): void {
    const missionName = this.name.trim();

    if (!missionName) {
      return;
    }

    const newMission: Mission = {
      id: crypto.randomUUID(),
      name: missionName,
      description: this.description.trim(),
      color: this.selectedColor,
      habitIds: [],
      createdAt: new Date().toISOString()
    };

    this.save.emit(newMission);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
