
import { Injectable, signal, effect } from '@angular/core';
import { Mission } from '../models/mission';
import { Habit } from '../models/habit';

interface OrbitData {
  missions: Mission[];
  habits: Habit[];
}

@Injectable({
  providedIn: 'root'
})
export class OrbitService {

  private readonly storageKey = 'orbita-data';

  // Cargar los datos guardados al iniciar el servicio.
  private initialData = this.loadData();

  // Colecciones principales.
  private missionsSignal = signal<Mission[]>(this.initialData.missions);
  private habitsSignal = signal<Habit[]>(this.initialData.habits);

  // Acceso de solo lectura a los componentes.
  missions = this.missionsSignal.asReadonly();
  habits = this.habitsSignal.asReadonly();

  constructor() {
    // Guardar automáticamente cuando cambien las misiones o los hábitos.
    effect(() => {
      const data: OrbitData = {
        missions: this.missionsSignal(),
        habits: this.habitsSignal()
      };

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      }
    });
  }

  // Recuperar los datos almacenados.
  private loadData(): OrbitData {
    const emptyData: OrbitData = {
      missions: [],
      habits: []
    };

    if (typeof localStorage === 'undefined') {
      return emptyData;
    }

    try {
      const savedData = localStorage.getItem(this.storageKey);

      if (!savedData) {
        return emptyData;
      }

      const parsedData = JSON.parse(savedData);

      if (
        !Array.isArray(parsedData.missions) ||
        !Array.isArray(parsedData.habits)
      ) {
        return emptyData;
      }

      return {
        missions: parsedData.missions,
        habits: parsedData.habits
      };

    } catch (error) {
      console.error('Error al recuperar los datos de ÓRBITA:', error);
      return emptyData;
    }
  }

  // Obtener todos los hábitos de una misión.
  getHabitsByMission(missionId: string): Habit[] {
    return this.habitsSignal().filter(
      habit => habit.missionId === missionId
    );
  }

  // Registrar una misión.
  addMission(mission: Mission): void {
    this.missionsSignal.update(missions => [
      ...missions,
      mission
    ]);
  }

  // Registrar un hábito.
  addHabit(habit: Habit): void {
    this.habitsSignal.update(habits => [
      ...habits,
      habit
    ]);
  }

  // Actualizar una misión.
  updateMission(updatedMission: Mission): void {
    this.missionsSignal.update(missions =>
      missions.map(mission =>
        mission.id === updatedMission.id
          ? updatedMission
          : mission
      )
    );
  }

  // Actualizar un hábito.
  updateHabit(updatedHabit: Habit): void {
    this.habitsSignal.update(habits =>
      habits.map(habit =>
        habit.id === updatedHabit.id
          ? updatedHabit
          : habit
      )
    );
  }

  // Eliminar una misión y sus hábitos asociados.
  deleteMission(missionId: string): void {
    this.missionsSignal.update(missions =>
      missions.filter(mission => mission.id !== missionId)
    );

    this.habitsSignal.update(habits =>
      habits.filter(habit => habit.missionId !== missionId)
    );
  }

  // Eliminar un hábito.
  deleteHabit(habitId: string): void {
    this.habitsSignal.update(habits =>
      habits.filter(habit => habit.id !== habitId)
    );
  }

  
  // Obtener las fechas de la semana actual (lunes a domingo).
  getCurrentWeekRange(): { start: string; end: string } {
    const today = new Date();
    const monday = new Date(today);

    const day = today.getDay();
    const difference = day === 0 ? -6 : 1 - day;

    monday.setDate(today.getDate() + difference);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      start: this.formatDateKey(monday),
      end: this.formatDateKey(sunday)
    };
  }

  // Obtener las fechas del mes actual.
  getCurrentMonthRange(): { start: string; end: string } {
    const today = new Date();

    const firstDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const lastDay = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );

    return {
      start: this.formatDateKey(firstDay),
      end: this.formatDateKey(lastDay)
    };
  }

  // Convertir una fecha al formato YYYY-MM-DD.
  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // Calcular el progreso semanal de un hábito.
  getWeeklyProgress(habit: Habit): number {
    const today = new Date();
    const range = this.getCurrentWeekRange();

    const completedDays = habit.completedDates.filter(date =>
      date >= range.start &&
      date <= this.formatDateKey(today)
    ).length;

const daysElapsed = today.getDay() === 0 ? 7 : today.getDay();

    return Math.round((completedDays / daysElapsed) * 100);
  }

  // Calcular el progreso mensual de un hábito.
  getMonthlyProgress(habit: Habit): number {
    const today = new Date();
    const range = this.getCurrentMonthRange();
    const todayKey = this.formatDateKey(today);

    const completedDays = habit.completedDates.filter(date =>
      date >= range.start &&
      date <= todayKey
    ).length;

    const elapsedDays = today.getDate();

    return Math.round((completedDays / elapsedDays) * 100);
  }

  // Calcular el progreso semanal de una misión.
  getMissionWeeklyProgress(missionId: string): number {
    const habits = this.getHabitsByMission(missionId);

    if (habits.length === 0) return 0;

    const total = habits.reduce(
      (sum, habit) => sum + this.getWeeklyProgress(habit),
      0
    );

    return Math.round(total / habits.length);
  }

  // Calcular el progreso mensual de una misión.
  getMissionMonthlyProgress(missionId: string): number {
    const habits = this.getHabitsByMission(missionId);

    if (habits.length === 0) return 0;

    const total = habits.reduce(
      (sum, habit) => sum + this.getMonthlyProgress(habit),
      0
    );

    return Math.round(total / habits.length);
  }

  
  // Calcular el porcentaje de hábitos completados en un día.
  getDailyProgress(missionId: string, dateKey: string): number {
    const habits = this.getHabitsByMission(missionId);

    if (habits.length === 0) return 0;

    const completedHabits = habits.filter(habit =>
      habit.completedDates.includes(dateKey)
    ).length;

    return Math.round((completedHabits / habits.length) * 100);
  }

  // Calcular la iluminación progresiva de las tres estrellas.
  getDailyStarProgress(missionId: string, dateKey: string): number[] {
    const progress = this.getDailyProgress(missionId, dateKey);

    const firstStar = Math.min(progress / 30, 1) * 100;

    const secondStar = Math.min(
      Math.max((progress - 30) / 20, 0),
      1
    ) * 100;

    const thirdStar = Math.min(
      Math.max((progress - 50) / 50, 0),
      1
    ) * 100;

    return [
      Math.round(firstStar),
      Math.round(secondStar),
      Math.round(thirdStar)
    ];
  }

  
}
