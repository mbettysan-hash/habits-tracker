
import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

import { OrbitService } from '../../core/services/orbit.service';
import { Mission } from '../../core/models/mission';
import { Habit } from '../../core/models/habit';

import { MissionForm } from '../../components/mission-form/mission-form';
import { HabitForm } from '../../components/habit-form/habit-form';

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [MissionForm, HabitForm, DatePipe],
  templateUrl: './missions.html',
  styleUrl: './missions.scss'
})
export class Missions {

  public orbitService = inject(OrbitService);

  missions = this.orbitService.missions;
  habits = this.orbitService.habits;

  // Misión seleccionada para consultar sus detalles
  selectedMission: Mission | null = null;

  // Control de formularios
  showMissionForm = false;
  showHabitForm = false;

  editingMission: Mission | null = null;
  editingHabit: Habit | null = null;


  // ==========================================
  // SELECCIÓN DE MISIONES
  // ==========================================

  selectMission(mission: Mission): void {
    this.selectedMission = mission;
  }

  backToMissions(): void {
    this.selectedMission = null;
  }


  // ==========================================
  // FORMULARIO DE MISIONES
  // ==========================================

  openMissionForm(): void {
    this.editingMission = null;
    this.showMissionForm = true;
  }

  openEditMissionForm(mission: Mission): void {
    this.editingMission = mission;
    this.showMissionForm = true;
  }

  closeMissionForm(): void {
    this.showMissionForm = false;
    this.editingMission = null;
  }

  saveMission(mission: Mission): void {
    if (this.editingMission) {
      this.orbitService.updateMission(mission);

      if (this.selectedMission?.id === mission.id) {
        this.selectedMission = mission;
      }
    } else {
      this.orbitService.addMission(mission);
    }

    this.closeMissionForm();
  }

  deleteMission(mission: Mission): void {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar la misión "${mission.name}"? También se eliminarán todos sus hábitos y registros de progreso.`
    );

    if (!confirmed) {
      return;
    }

    this.orbitService.deleteMission(mission.id);

    if (this.selectedMission?.id === mission.id) {
      this.selectedMission = null;
    }
  }


  // ==========================================
  // FORMULARIO DE HÁBITOS
  // ==========================================

  openHabitForm(mission: Mission): void {
    if (this.getHabitCount(mission.id) >= 6) {
      return;
    }

    this.editingHabit = null;
    this.selectedMission = mission;
    this.showHabitForm = true;
  }

  openEditHabitForm(habit: Habit): void {
    const mission = this.missions().find(
      item => item.id === habit.missionId
    );

    if (!mission) {
      return;
    }

    this.editingHabit = habit;
    this.selectedMission = mission;
    this.showHabitForm = true;
  }

  closeHabitForm(): void {
    this.showHabitForm = false;
    this.editingHabit = null;
  }

  saveHabit(habit: Habit): void {
    if (this.editingHabit) {
      this.orbitService.updateHabit(habit);
    } else {
      if (this.getHabitCount(habit.missionId) >= 6) {
        this.closeHabitForm();
        return;
      }

      this.orbitService.addHabit(habit);
    }

    this.closeHabitForm();
  }

  deleteHabit(habit: Habit): void {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar el hábito "${habit.name}"? También se eliminará su historial de cumplimiento.`
    );

    if (!confirmed) {
      return;
    }

    this.orbitService.deleteHabit(habit.id);
  }


  // ==========================================
  // CONSULTA DE HÁBITOS
  // ==========================================

  getHabitsByMission(missionId: string): Habit[] {
    return this.orbitService.getHabitsByMission(missionId);
  }

  getHabitCount(missionId: string): number {
    return this.getHabitsByMission(missionId).length;
  }


  // ==========================================
  // SEGUIMIENTO SEMANAL
  // ==========================================

  getWeekDays() {
    const today = new Date();
    const currentDay = today.getDay();

    const monday = new Date(today);
    const difference = currentDay === 0 ? -6 : 1 - currentDay;

    monday.setDate(today.getDate() + difference);

    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    return days.map((label, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      const dateKey = this.formatDate(date);
      const todayKey = this.formatDate(today);

      return {
        label,
        dateKey,
        isToday: dateKey === todayKey,
        isFuture: dateKey > todayKey
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
  // PROGRESO DE LOS HÁBITOS
  // ==========================================

  getHabitProgress(habit: Habit): number {
    const weekDays = this.getWeekDays();

    const completedDays = weekDays.filter(day =>
      this.isHabitDayCompleted(habit, day.dateKey)
    ).length;

    return Math.round((completedDays / 7) * 100);
  }


  // ==========================================
  // PROGRESO DE LAS MISIONES
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

}

