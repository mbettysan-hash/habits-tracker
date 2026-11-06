
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { OrbitService } from '../../core/services/orbit.service';
import { Mission } from '../../core/models/mission';
import { Habit } from '../../core/models/habit';

interface UniversePlanet {
  id: string;
  name: string;
  color: string;
  planetType: number;
  x: number;
  y: number;
  size: number;
}

interface DailyPlanet {
  id: string;
  habitId: string;
  dateKey: string;
  dayIndex: number;
  name: string;
  color: string;
  planetType: number;
  completed: boolean;
  x: number;
  y: number;
  size: number;
}

interface UniverseStation {
  id: string;
  label: string;
  dateKey: string;
  isToday: boolean;
  isFuture: boolean;
  isPast: boolean;
  progress: number;
  stars: number[];
  x: number;
  y: number;
}

@Component({
  selector: 'app-universe',
  standalone: true,
  imports: [],
  templateUrl: './universe.html',
  styleUrl: './universe.scss'
})
export class Universe implements AfterViewInit, OnDestroy {


  private cdr = inject(ChangeDetectorRef);
  private orbitService = inject(OrbitService);

  // Misiones registradas en la aplicación.
  missions = this.orbitService.missions;

  // Misión actualmente seleccionada.
  selectedMissionId: string | null = null;

  get selectedMission(): Mission | null {
    return this.missions().find(
      mission => mission.id === this.selectedMissionId
    ) ?? null;
  }

  positionsReady = false;

  @ViewChild('mainRoute')
  mainRoute!: ElementRef<SVGPathElement>;

  @ViewChild('universeScene')
  universeScene!: ElementRef<HTMLDivElement>;

  selectedPlanet: string | null = null;

  private resizeObserver?: ResizeObserver;
  private animationFrameId: number | null = null;
  private midnightTimeout: ReturnType<typeof setTimeout> | null = null;

  // Planetas generados a partir de los hábitos de la misión.
  planets: UniversePlanet[] = [];

  // Estaciones que representan los días de la semana.
  stations: UniverseStation[] = [];

  dailyPlanets: DailyPlanet[] = [];

  shipPosition = { x: 0, y: 0 };
  destinationPosition = { x: 0, y: 0 };

  // Posición de avance de la nave según el progreso.
  // Avance de la nave según el periodo seleccionado.
get shipProgress(): number {
  if (!this.selectedMissionId) return 0;

  const habits = this.orbitService.getHabitsByMission(
    this.selectedMissionId
  );

  if (habits.length === 0) return 0;

  const today = new Date();
  const todayKey = this.formatDateKey(today);

  // UNIVERSO SEMANAL
  if (this.universeMode === 'weekly') {
    const currentDay = today.getDay();

    // Convertir lunes-domingo a índices del 0 al 6.
    const dayIndex = currentDay === 0 ? 6 : currentDay - 1;

    // Progreso de los hábitos del día actual.
    const dailyProgress = this.orbitService.getDailyProgress(
      this.selectedMissionId,
      todayKey
    );

    // Cada día anterior cuenta como un tramo recorrido.
    // El día actual avanza según los hábitos completados.
    const totalProgress = dayIndex + (dailyProgress / 100);

    return Math.min(
      100,
      Math.round((totalProgress / 7) * 100)
    );
  }

  // UNIVERSO MENSUAL: conservar el cálculo anterior.
  const range = this.orbitService.getCurrentMonthRange();

  const completedDays = habits.reduce((total, habit) => {
    return total + habit.completedDates.filter(date =>
      date >= range.start &&
      date <= range.end &&
      date <= todayKey
    ).length;
  }, 0);

  const startDate = new Date(`${range.start}T00:00:00`);
  const endDate = new Date(`${range.end}T00:00:00`);

  const totalDays =
    Math.round(
      (endDate.getTime() - startDate.getTime()) / 86400000
    ) + 1;

  const totalOpportunities = habits.length * totalDays;

  return Math.min(
    100,
    Math.round((completedDays / totalOpportunities) * 100)
  );
}

  // Formatear fechas como YYYY-MM-DD.
  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  ngAfterViewInit(): void {

    // Observar los cambios de tamaño del escenario.
    this.resizeObserver = new ResizeObserver(() => {
      this.schedulePositionUpdate();
    });

    this.resizeObserver.observe(this.universeScene.nativeElement);

    // Seleccionar automáticamente la primera misión disponible.
    const firstMission = this.missions()[0];

    if (firstMission) {
      this.selectMission(firstMission.id);
    } else {
      this.schedulePositionUpdate();
    }
    this.scheduleMidnightRefresh();
  }

  // Programar actualización automática al comenzar un nuevo día.
private scheduleMidnightRefresh(): void {
  if (this.midnightTimeout !== null) {
    clearTimeout(this.midnightTimeout);
  }

  const nextMidnight = new Date();
  nextMidnight.setHours(24, 0, 0, 50);

  const delay = nextMidnight.getTime() - Date.now();

  this.midnightTimeout = setTimeout(() => {

    // Actualizar las fechas y los datos del universo semanal.
    if (this.universeMode === 'weekly' && this.selectedMissionId) {
      this.generateWeeklyStations();
      this.generateDailyPlanets();
    }

    // Actualizar la interfaz y la posición de la nave.
    this.cdr.markForCheck();
    this.schedulePositionUpdate();

    // Programar el siguiente cambio de día.
    this.scheduleMidnightRefresh();

  }, delay);
}

  ngOnDestroy(): void {

    this.resizeObserver?.disconnect();

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.midnightTimeout !== null) {
  clearTimeout(this.midnightTimeout);
}
  }

  // Seleccionar una misión y generar sus planetas.
  selectMission(missionId: string): void {

    this.selectedMissionId = missionId;
    this.selectedPlanet = null;
    this.positionsReady = false;

    const habits = this.orbitService.getHabitsByMission(missionId);

    this.planets = habits.map((habit: Habit, index: number) => ({
      id: habit.id,
      name: habit.name,
      color: habit.color,
      planetType: habit.planetType,
      x: 0,
      y: 0,
      size: index % 2 === 0 ? 52 : 58
    }));

    this.generateWeeklyStations();
    this.generateDailyPlanets();

    this.schedulePositionUpdate();
    this.cdr.markForCheck();
  }

  // Periodo del universo que se está visualizando.
  universeMode: 'weekly' | 'monthly' = 'weekly';

  // Obtener el progreso de la misión según el universo seleccionado.
  get missionProgress(): number {
    if (!this.selectedMissionId) return 0;

    return this.universeMode === 'weekly'
      ? this.orbitService.getMissionWeeklyProgress(this.selectedMissionId)
      : this.orbitService.getMissionMonthlyProgress(this.selectedMissionId);
  }

  // Cambiar entre el universo semanal y mensual.
  changeUniverseMode(mode: 'weekly' | 'monthly'): void {
    this.universeMode = mode;
    this.selectedPlanet = null;

    this.schedulePositionUpdate();
    this.cdr.markForCheck();
  }

  private schedulePositionUpdate(): void {

    if (this.animationFrameId !== null) {
      return;
    }

    this.animationFrameId = requestAnimationFrame(() => {
      this.animationFrameId = null;
      this.updatePlanetPositions();
    });
  }

  private getPositionAtLength(length: number): {
    x: number;
    y: number;
  } {

    const path = this.mainRoute.nativeElement;
    const scene = this.universeScene.nativeElement;

    const point = path.getPointAtLength(length);
    const matrix = path.getScreenCTM();
    const sceneRect = scene.getBoundingClientRect();

    if (
      !matrix ||
      sceneRect.width <= 0 ||
      sceneRect.height <= 0
    ) {
      return { x: 0, y: 0 };
    }

    const screenPoint = new DOMPoint(point.x, point.y)
      .matrixTransform(matrix);

    return {
      x: ((screenPoint.x - sceneRect.left) / sceneRect.width) * 100,
      y: ((screenPoint.y - sceneRect.top) / sceneRect.height) * 100
    };
  }

  updatePlanetPositions(): void {

    const path = this.mainRoute.nativeElement;
    const scene = this.universeScene.nativeElement;
    const sceneRect = scene.getBoundingClientRect();

    if (
      sceneRect.width <= 0 ||
      sceneRect.height <= 0 ||
      !path.getScreenCTM()
    ) {
      return;
    }

    const totalLength = path.getTotalLength();

    // Posición de la nave según el progreso del universo.
    const progressLength = totalLength * (this.shipProgress / 100);

    this.shipPosition = this.getPositionAtLength(progressLength);

    // Posición final de la estrella.
    this.destinationPosition = this.getPositionAtLength(totalLength);

    // Distribuir los hábitos sobre la trayectoria.
    const totalPlanets = this.planets.length;

    // Distribuir los planetas alrededor de la ruta.
    this.planets = this.planets.map((planet, index) => {
      const progress = (index + 1) / (this.planets.length + 1);
      const length = totalLength * progress;

      const position = this.getPositionAtLength(length);
      const nextPosition = this.getPositionAtLength(
        Math.min(length + 5, totalLength)
      );

      const dx = nextPosition.x - position.x;
      const dy = nextPosition.y - position.y;
      const magnitude = Math.sqrt(dx * dx + dy * dy) || 1;

      // Alternar planetas a ambos lados de la ruta.
      const direction = index % 2 === 0 ? 1 : -1;
      const offset = 17;
      

      return {
        ...planet,
        x: position.x + (dy / magnitude) * offset * direction,
        y: position.y - (dx / magnitude) * offset * direction
      };
    });

    // Distribuir las estaciones al final de cada tramo diario.
    this.stations = this.stations.map((station, index) => {
      const progress = (index + 1) / 7;

      const position = this.getPositionAtLength(
        totalLength * progress
      );

      return {
        ...station,
        x: position.x,
        y: position.y
      };
    });

    // Distribuir los planetas dentro del tramo de cada día.
this.dailyPlanets = this.dailyPlanets.map(planet => {
  const dayIndex = planet.dayIndex;

  const planetsOfDay = this.dailyPlanets.filter(
    item => item.dayIndex === dayIndex
  );

  const habitIndex = planetsOfDay.findIndex(
    item => item.habitId === planet.habitId
  );

  const habitCount = planetsOfDay.length;

  // Cada día ocupa una séptima parte de la ruta.
  const segmentStart = totalLength * (dayIndex / 7);
  const segmentEnd = totalLength * ((dayIndex + 1) / 7);

  // Separar los planetas uniformemente dentro del tramo.
 const progress = (habitIndex + 0.5) / habitCount;

  const length = segmentStart +
    (segmentEnd - segmentStart) * progress;

  const position = this.getPositionAtLength(length);

  const nextPosition = this.getPositionAtLength(
    Math.min(length + 5, totalLength)
  );

  const dx = nextPosition.x - position.x;
  const dy = nextPosition.y - position.y;
  const magnitude = Math.sqrt(dx * dx + dy * dy) || 1;

  // Alternar los planetas a ambos lados de la ruta.
 const direction = habitIndex % 2 === 0 ? 1 : -1;

// Alternar posiciones a ambos lados de la trayectoria.
const offset = 1.5 + (habitIndex % 3) * 0.5;

  return {
    ...planet,
    x: position.x + (dy / magnitude) * offset * direction,
    y: position.y - (dx / magnitude) * offset * direction,
    size: 45
  };
});

    this.positionsReady = true;
    this.cdr.markForCheck();
  }

  selectPlanet(name: string): void {
    this.selectedPlanet =
      this.selectedPlanet === name ? null : name;
  }

  // Generar las siete estaciones de la semana actual.
  generateWeeklyStations(): void {
    if (!this.selectedMissionId) {
      this.stations = [];
      return;
    }

    const today = new Date();
    const currentDay = today.getDay();

    const monday = new Date(today);
    monday.setDate(
      today.getDate() + (currentDay === 0 ? -6 : 1 - currentDay)
    );

    const labels = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo'
    ];

    const todayKey = this.formatDateKey(today);

    this.stations = labels.map((label, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      const dateKey = this.formatDateKey(date);

      const isToday = dateKey === todayKey;
      const isFuture = dateKey > todayKey;
      const isPast = dateKey < todayKey;

      const progress = this.orbitService.getDailyProgress(
        this.selectedMissionId!,
        dateKey
      );

      const stars = this.orbitService.getDailyStarProgress(
        this.selectedMissionId!,
        dateKey
      );

      return {
        id: dateKey,
        label,
        dateKey,
        isToday,
        isFuture,
        isPast,
        progress,
        stars,
        x: 0,
        y: 0
      };
    });
  }

  // Generar una representación de cada hábito para cada día.
  generateDailyPlanets(): void {
    if (!this.selectedMissionId) {
      this.dailyPlanets = [];
      return;
    }

    const habits = this.orbitService.getHabitsByMission(
      this.selectedMissionId
    );

    const today = new Date();
    const currentDay = today.getDay();

    const monday = new Date(today);
    monday.setDate(
      today.getDate() + (currentDay === 0 ? -6 : 1 - currentDay)
    );

    const dailyPlanets: DailyPlanet[] = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + dayIndex);

      const dateKey = this.formatDateKey(date);

      for (const habit of habits) {
        dailyPlanets.push({
          id: `${habit.id}-${dateKey}`,
          habitId: habit.id,
          dateKey,
          dayIndex,
          name: habit.name,
          color: habit.color,
          planetType: habit.planetType,
          completed: habit.completedDates.includes(dateKey),
          x: 0,
          y: 0,
          size: 0
        });
      }
    }

    this.dailyPlanets = dailyPlanets;
  }


}
