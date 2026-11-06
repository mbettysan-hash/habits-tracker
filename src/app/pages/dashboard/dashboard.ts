import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { OrbitService } from '../../core/services/orbit.service';
import { Mission } from '../../core/models/mission';
import { Habit } from '../../core/models/habit';
import { MissionForm } from '../../components/mission-form/mission-form';
import { HabitForm } from '../../components/habit-form/habit-form';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MissionForm, HabitForm, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  private orbitService = inject(OrbitService);

  missions = this.orbitService.missions;
  habits = this.orbitService.habits;

  showMissionForm = false;
  showHabitForm = false;

  selectedMission: Mission | null = null;

  // Formulario de misiones
  openMissionForm(): void {
    this.showMissionForm = true;
  }

  closeMissionForm(): void {
    this.showMissionForm = false;
  }

  createMission(mission: Mission): void {
    this.orbitService.addMission(mission);
    this.closeMissionForm();
  }

  // Formulario de hábitos
  openHabitForm(mission: Mission): void {
    const totalHabits = this.getHabitCount(mission.id);

    if (totalHabits >= 6) {
      return;
    }

    this.selectedMission = mission;
    this.showHabitForm = true;
  }

  closeHabitForm(): void {
    this.showHabitForm = false;
    this.selectedMission = null;
  }

  createHabit(habit: Habit): void {
    const totalHabits = this.getHabitCount(habit.missionId);

    if (totalHabits >= 6) {
      this.closeHabitForm();
      return;
    }

    this.orbitService.addHabit(habit);
    this.closeHabitForm();
  }

  // Obtener hábitos de una misión
  getHabitsByMission(missionId: string): Habit[] {
    return this.orbitService.getHabitsByMission(missionId);
  }

  // Contar hábitos de una misión
  getHabitCount(missionId: string): number {
    return this.getHabitsByMission(missionId).length;
  }

  getWeekDays() {
  const today = new Date();
  const currentDay = today.getDay();

  // Obtener el lunes de la semana actual
  const monday = new Date(today);
  const difference = currentDay === 0 ? -6 : 1 - currentDay;

  monday.setDate(today.getDate() + difference);

  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return days.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      label,
      dateKey: this.formatDate(date),
      isToday: this.formatDate(date) === this.formatDate(today)
    };
  });
}

private formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

isHabitDayCompleted(habit: Habit, dateKey: string): boolean {
  return habit.completedDates.includes(dateKey);
}

toggleHabitDay(habit: Habit, dateKey: string): void {
  const completedDates = this.isHabitDayCompleted(habit, dateKey)
    ? habit.completedDates.filter(date => date !== dateKey)
    : [...habit.completedDates, dateKey];

  this.orbitService.updateHabit({
    ...habit,
    completedDates
  });
}


  // ==========================================
  // CÁLCULO DEL PROGRESO DE LOS HÁBITOS
  // ==========================================

  getHabitProgress(habit: Habit): number {
    const weekDays = this.getWeekDays();

    const completedDays = weekDays.filter(day =>
      this.isHabitDayCompleted(habit, day.dateKey)
    ).length;

    return Math.round((completedDays / 7) * 100);
  }

  // ==========================================
  // CÁLCULO DEL PROGRESO DE LAS MISIONES
  // ==========================================

  getMissionProgress(missionId: string): number {
    const missionHabits = this.getHabitsByMission(missionId);

    if (missionHabits.length === 0) {
      return 0;
    }

    const totalProgress = missionHabits.reduce(
      (total, habit) => total + this.getHabitProgress(habit),
      0
    );

    return Math.round(totalProgress / missionHabits.length);
  }

  // ==========================================
  // CÁLCULO DEL PROGRESO GENERAL
  // ==========================================

  getOverallProgress(): number {
    const missionsWithHabits = this.missions().filter(
      mission => this.getHabitCount(mission.id) > 0
    );

    if (missionsWithHabits.length === 0) {
      return 0;
    }

    const totalProgress = missionsWithHabits.reduce(
      (total, mission) => total + this.getMissionProgress(mission.id),
      0
    );

    return Math.round(totalProgress / missionsWithHabits.length);
  }

}




