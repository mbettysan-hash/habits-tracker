
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Habit } from '../../core/models/habit';
import { Mission } from '../../core/models/mission';

@Component({
  selector: 'app-habit-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './habit-form.html',
  styleUrl: './habit-form.scss'
})
export class HabitForm {

  @Input() missions: Mission[] = [];

  @Output() save = new EventEmitter<Habit>();
  @Output() cancel = new EventEmitter<void>();

  name = '';
  selectedEmoji = '📚';
  selectedColor = '#C9B6E4';
  selectedMissionId = '';

  emojis = [
    '📚', '🏃', '💧', '🧘', '🎯',
    '🎨', '💻', '🥗', '😴', '🎸',
    '📝', '🚴', '🧠', '🌱', '💪'
  ];

  colors = [
    { value: '#C9B6E4', label: 'Morado' },
    { value: '#FF806B', label: 'Coral' },
    { value: '#FFD166', label: 'Amarillo' },
    { value: '#A8DDB5', label: 'Verde' },
    { value: '#A9D5ED', label: 'Azul' }
  ];

  onSubmit(): void {
    const habitName = this.name.trim();

    if (!habitName || !this.selectedMissionId) {
      return;
    }

const newHabit: Habit = {
  id: crypto.randomUUID(),
  missionId: this.selectedMissionId,
  name: habitName,
  emoji: this.selectedEmoji,
  color: this.selectedColor,
  planetType: Math.floor(Math.random() * 10) + 1,
  completedDates: [],
  createdAt: new Date().toISOString()
};

    this.save.emit(newHabit);

    this.resetForm();
  }

  onCancel(): void {
    this.resetForm();
    this.cancel.emit();
  }

  private resetForm(): void {
    this.name = '';
    this.selectedEmoji = '📚';
    this.selectedColor = '#C9B6E4';
    this.selectedMissionId = '';
  }
}
