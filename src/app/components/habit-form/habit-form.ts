

import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

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
export class HabitForm implements OnChanges {

  @Input() missions: Mission[] = [];
  @Input() existingHabits: Habit[] = [];
  @Input() habit: Habit | null = null;

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

  // Cargar los datos cuando se abre el formulario de edición
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['habit'] && this.habit) {
      this.name = this.habit.name;
      this.selectedEmoji = this.habit.emoji;
      this.selectedColor = this.habit.color;
      this.selectedMissionId = this.habit.missionId;
    }
  }

  // Crear o actualizar un hábito
  onSubmit(): void {
    const habitName = this.name.trim();

    if (!habitName || !this.selectedMissionId) {
      return;
    }

    const updatedHabit: Habit = {
      id: this.habit?.id ?? crypto.randomUUID(),

      missionId: this.habit?.missionId ?? this.selectedMissionId,

      name: habitName,
      emoji: this.selectedEmoji,
      color: this.selectedColor,

      // Conservar el planeta original al editar
      planetType: this.habit?.planetType ?? this.getAvailablePlanetType(),

      // Conservar la apariencia original al editar
      visualParts: this.habit?.visualParts ?? {
        lights: this.getRandomParts('light', 11, 1, 2),
        noises: this.getRandomParts('noise', 28, 2, 4),
        spheres: this.getRandomParts('sphere', 3, 1, 2)
      },

      // Conservar el historial de cumplimiento
      completedDates: this.habit?.completedDates ?? [],

      // Conservar la fecha de creación
      createdAt: this.habit?.createdAt ?? new Date().toISOString()
    };

    this.save.emit(updatedHabit);

    this.resetForm();
  }

  // Obtener un tipo de planeta que no esté ocupado en la misión
  private getAvailablePlanetType(): number {
    const usedPlanetTypes = this.existingHabits
      .filter(habit => habit.missionId === this.selectedMissionId)
      .map(habit => habit.planetType);

    const availablePlanetTypes = Array.from(
      { length: 10 },
      (_, index) => index + 1
    ).filter(type => !usedPlanetTypes.includes(type));

    const randomIndex = Math.floor(
      Math.random() * availablePlanetTypes.length
    );

    return availablePlanetTypes[randomIndex];
  }

  // Generar elementos visuales aleatorios para un planeta nuevo
  private getRandomParts(
    prefix: string,
    total: number,
    min: number,
    max: number
  ): string[] {

    const available = Array.from(
      { length: total },
      (_, index) => `${prefix}${prefix === 'noise'
        ? String(index).padStart(2, '0')
        : index}.png`
    );

    const shuffled = available.sort(() => Math.random() - 0.5);

    const quantity = Math.floor(
      Math.random() * (max - min + 1)
    ) + min;

    return shuffled.slice(0, quantity);
  }

  // Cancelar formulario
  onCancel(): void {
    this.resetForm();
    this.cancel.emit();
  }

  // Limpiar formulario
  private resetForm(): void {
    this.name = '';
    this.selectedEmoji = '📚';
    this.selectedColor = '#C9B6E4';
    this.selectedMissionId = '';
  }

}
