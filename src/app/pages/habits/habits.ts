
import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

import { OrbitService } from '../../core/services/orbit.service';
import { Mission } from '../../core/models/mission';
import { Habit } from '../../core/models/habit';

import { HabitForm } from '../../components/habit-form/habit-form';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [HabitForm, DatePipe, RouterLink],
  templateUrl: './habits.html',
  styleUrl: './habits.scss'
})
export class Habits {

  public orbitService = inject(OrbitService);

  missions = this.orbitService.missions;
  habits = this.orbitService.habits;

  selectedMission: Mission | null = null;
  editingHabit: Habit | null = null;
  showHabitForm = false;

  openHabitForm(mission: Mission): void {
    if (this.getHabitCount(mission.id) >= 6) {
      return;
    }

    this.selectedMission = mission;
    this.editingHabit = null;
    this.showHabitForm = true;
  }

  openEditHabitForm(habit: Habit): void {
    const mission = this.missions().find(
      item => item.id === habit.missionId
    );

    if (!mission) {
      return;
    }

    this.selectedMission = mission;
    this.editingHabit = habit;
    this.showHabitForm = true;
  }

  closeHabitForm(): void {
    this.showHabitForm = false;
    this.selectedMission = null;
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

  getHabitsByMission(missionId: string): Habit[] {
    return this.orbitService.getHabitsByMission(missionId);
  }

  getHabitCount(missionId: string): number {
    return this.getHabitsByMission(missionId).length;
  }

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

  getHabitProgress(habit: Habit): number {
    const weekDays = this.getWeekDays();

    const completedDays = weekDays.filter(day =>
      this.isHabitDayCompleted(habit, day.dateKey)
    ).length;

    return Math.round((completedDays / 7) * 100);
  }
}

