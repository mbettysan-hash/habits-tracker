
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
  visualParts?: {
    lights: string[];
    noises: string[];
    spheres: string[];
  };
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

interface UniverseGalaxy {
  id: string;
  monthIndex: number;
  monthName: string;
  year: number;
  startDate: string;
  endDate: string;
  progress: number;
  completedHabits: number;
  totalHabits: number;
  status: 'completed' | 'current' | 'pending' | 'incomplete';
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

  // Ruta del universo semanal.
  @ViewChild('mainRoute')
  mainRoute?: ElementRef<SVGPathElement>;

  // Ruta del universo mensual.
  @ViewChild('monthlyRoute')
  monthlyRoute?: ElementRef<SVGPathElement>;

  @ViewChild('universeScene')
  universeScene!: ElementRef<HTMLDivElement>;

  // Identificador del planeta seleccionado.
  selectedPlanet: string | null = null;

  // Identificador de la estación seleccionada.
  selectedStationId: string | null = null;

  // Planeta seleccionado en el universo semanal.
  get selectedDailyPlanet(): DailyPlanet | null {
    return this.dailyPlanets.find(
      planet => planet.id === this.selectedPlanet
    ) ?? null;
  }

  // Estación seleccionada en el universo semanal.
  get selectedStation(): UniverseStation | null {
    return this.stations.find(
      station => station.id === this.selectedStationId
    ) ?? null;
  }

  private resizeObserver?: ResizeObserver;
  private animationFrameId: number | null = null;
  private midnightTimeout: ReturnType<typeof setTimeout> | null = null;

  // Planetas generados a partir de los hábitos de la misión.
  planets: UniversePlanet[] = [];

  // Estaciones que representan los días de la semana.
  stations: UniverseStation[] = [];

  // Planetas que representan los hábitos de cada día.
  dailyPlanets: DailyPlanet[] = [];

  // Las doce galaxias que representan los meses del año.
  galaxies: UniverseGalaxy[] = [];

  // Identificador de la galaxia seleccionada.
  selectedGalaxyId: string | null = null;

  // Obtener la galaxia seleccionada.
  get selectedGalaxy(): UniverseGalaxy | null {
    return this.galaxies.find(
      galaxy => galaxy.id === this.selectedGalaxyId
    ) ?? null;
  }

  // Posición y orientación de la nave.
  shipPosition = { x: 0, y: 0 };
  destinationPosition = { x: 0, y: 0 };
  shipRotation = 40;

  // Periodo del universo que se está visualizando.
  universeMode: 'weekly' | 'monthly' = 'weekly';

  // Posición de avance de la nave según el progreso.
  get shipProgress(): number {

    if (!this.selectedMissionId) {
      return 0;
    }

    const habits = this.orbitService.getHabitsByMission(
      this.selectedMissionId
    );

    if (habits.length === 0) {
      return 0;
    }

    // UNIVERSO MENSUAL.
    // El avance representa el promedio de las doce galaxias.
    if (this.universeMode === 'monthly') {
      return this.monthlyShipProgress;
    }

    // UNIVERSO SEMANAL.
    const today = new Date();
    const todayKey = this.formatDateKey(today);

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

      if (this.selectedMissionId) {

        // Actualizar los datos del universo semanal.
        if (this.universeMode === 'weekly') {
          this.generateWeeklyStations();
          this.generateDailyPlanets();
        }

        // Actualizar las doce galaxias del año.
        if (this.universeMode === 'monthly') {
          this.generateMonthlyGalaxies();
        }
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

  // Seleccionar una misión y generar sus elementos.
  selectMission(missionId: string): void {

    this.selectedMissionId = missionId;

    this.selectedPlanet = null;
    this.selectedStationId = null;
    this.selectedGalaxyId = null;

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
    this.generateMonthlyGalaxies();

    this.schedulePositionUpdate();
    this.cdr.markForCheck();
  }

  // Obtener el progreso de la misión según el universo seleccionado.
  get missionProgress(): number {

    if (!this.selectedMissionId) {
      return 0;
    }

    return this.universeMode === 'weekly'
      ? this.orbitService.getMissionWeeklyProgress(this.selectedMissionId)
      : this.monthlyShipProgress;
  }

  // Cambiar entre el universo semanal y mensual.
  changeUniverseMode(mode: 'weekly' | 'monthly'): void {

    this.universeMode = mode;

    this.selectedPlanet = null;
    this.selectedStationId = null;
    this.selectedGalaxyId = null;

    this.positionsReady = false;

    this.schedulePositionUpdate();
    this.cdr.markForCheck();
  }

  // Programar el cálculo de posiciones.
  private schedulePositionUpdate(): void {

    if (this.animationFrameId !== null) {
      return;
    }

    this.animationFrameId = requestAnimationFrame(() => {
      this.animationFrameId = null;
      this.updatePlanetPositions();
    });
  }

  // Obtener la ruta correspondiente al universo seleccionado.
  private getActiveRoute(): SVGPathElement | null {

    if (this.universeMode === 'weekly') {
      return this.mainRoute?.nativeElement ?? null;
    }

    return this.monthlyRoute?.nativeElement ?? null;
  }

  // Obtener la posición de un punto sobre una ruta específica.
  private getPositionAtLength(
    path: SVGPathElement,
    length: number
  ): { x: number; y: number } {

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

  // Obtener la orientación de la nave sobre una ruta específica.
  private getShipAngleAtLength(
    path: SVGPathElement,
    length: number
  ): number {

    const matrix = path.getScreenCTM();

    if (!matrix) {
      return 0;
    }

    const totalLength = path.getTotalLength();

    const startLength = Math.max(0, length - 5);
    const endLength = Math.min(totalLength, length + 5);

    const startPoint = path.getPointAtLength(startLength);
    const endPoint = path.getPointAtLength(endLength);

    const startScreen = new DOMPoint(startPoint.x, startPoint.y)
      .matrixTransform(matrix);

    const endScreen = new DOMPoint(endPoint.x, endPoint.y)
      .matrixTransform(matrix);

    const dx = endScreen.x - startScreen.x;
    const dy = endScreen.y - startScreen.y;

    return Math.atan2(dy, dx) * (180 / Math.PI);
  }

  // Actualizar las posiciones de los elementos del universo.
  updatePlanetPositions(): void {

    const path = this.getActiveRoute();

    const scene = this.universeScene?.nativeElement;

    if (!path || !scene) {
      this.positionsReady = false;
      return;
    }

    const sceneRect = scene.getBoundingClientRect();

    if (
      sceneRect.width <= 0 ||
      sceneRect.height <= 0 ||
      !path.getScreenCTM()
    ) {
      this.positionsReady = false;
      return;
    }

    const totalLength = path.getTotalLength();

    if (totalLength <= 0) {
      return;
    }

    // Posición de la nave según el progreso del universo.
    const progressLength = totalLength * (this.shipProgress / 100);

    this.shipPosition = this.getPositionAtLength(
      path,
      progressLength
    );

    // Orientación de la nave según la trayectoria.
    const routeAngle = this.getShipAngleAtLength(
      path,
      progressLength
    );

    // Conservar la orientación base de la imagen.
    this.shipRotation = routeAngle + 263;

    // Posición final del recorrido.
    this.destinationPosition = this.getPositionAtLength(
      path,
      totalLength
    );

    // UNIVERSO MENSUAL.
    if (this.universeMode === 'monthly') {

      this.updateMonthlyGalaxyPositions(path, totalLength);

    } else {

      // UNIVERSO SEMANAL.
      this.updateWeeklyPlanetPositions(path, totalLength);
    }

    this.positionsReady = true;
    this.cdr.markForCheck();
  }

  // Distribuir los planetas y estaciones del universo semanal.
  private updateWeeklyPlanetPositions(
    path: SVGPathElement,
    totalLength: number
  ): void {

    // Distribuir los hábitos sobre la trayectoria.
    this.planets = this.planets.map((planet, index) => {

      const progress = (index + 1) / (this.planets.length + 1);
      const length = totalLength * progress;

      const position = this.getPositionAtLength(path, length);

      const nextPosition = this.getPositionAtLength(
        path,
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
        path,
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

      const position = this.getPositionAtLength(path, length);

      const nextPosition = this.getPositionAtLength(
        path,
        Math.min(length + 5, totalLength)
      );

      const dx = nextPosition.x - position.x;
      const dy = nextPosition.y - position.y;

      const magnitude = Math.sqrt(dx * dx + dy * dy) || 1;

      // Alternar los planetas a ambos lados de la ruta.
      const direction = habitIndex % 2 === 0 ? 1 : -1;

      const offset = 1.5 + (habitIndex % 3) * 0.5;

      return {
        ...planet,
        x: position.x + (dy / magnitude) * offset * direction,
        y: position.y - (dx / magnitude) * offset * direction,
        size: 45
      };
    });
  }

  // Distribuir las doce galaxias sobre la ruta mensual.
  private updateMonthlyGalaxyPositions(
    path: SVGPathElement,
    totalLength: number
  ): void {

    this.galaxies = this.galaxies.map((galaxy, index) => {

      // Distribuir las doce galaxias uniformemente.
      // Se reserva el inicio y el final del recorrido.
      const progress = (index + 1) / 13;

      const length = totalLength * progress;

      const position = this.getPositionAtLength(path, length);

      return {
        ...galaxy,
        x: position.x,
        y: position.y
      };
    });
  }

  // Seleccionar o cerrar la información de un planeta.
  selectPlanet(planetId: string): void {

    this.selectedStationId = null;
    this.selectedGalaxyId = null;

    this.selectedPlanet =
      this.selectedPlanet === planetId ? null : planetId;
  }

  // Seleccionar o cerrar la información de una estación.
  selectStation(stationId: string): void {

    this.selectedPlanet = null;
    this.selectedGalaxyId = null;

    this.selectedStationId =
      this.selectedStationId === stationId ? null : stationId;
  }

  // Obtener el estado del hábito para el día seleccionado.
  getSelectedPlanetStatus(): string {

    const planet = this.selectedDailyPlanet;

    if (!planet) {
      return '';
    }

    if (planet.completed) {
      return 'Cumplido';
    }

    const todayKey = this.formatDateKey(new Date());

    if (planet.dateKey > todayKey) {
      return 'Pendiente';
    }

    return 'Incumplido';
  }

  // Calcular el progreso semanal del hábito seleccionado.
  getSelectedHabitWeeklyProgress(): number {

    const planet = this.selectedDailyPlanet;

    if (!planet) {
      return 0;
    }

    const habit = this.orbitService.habits().find(
      item => item.id === planet.habitId
    );

    if (!habit) {
      return 0;
    }

    const today = new Date();
    const currentDay = today.getDay();

    const monday = new Date(today);

    monday.setDate(
      today.getDate() + (currentDay === 0 ? -6 : 1 - currentDay)
    );

    let completedDays = 0;

    for (let index = 0; index < 7; index++) {

      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      if (habit.completedDates.includes(this.formatDateKey(date))) {
        completedDays++;
      }
    }

    return Math.round((completedDays / 7) * 100);
  }

  // Obtener el estado de la estación seleccionada.
  getSelectedStationStatus(): string {

    const station = this.selectedStation;

    if (!station) {
      return '';
    }

    if (station.progress >= 100) {
      return 'Cumplido';
    }

    if (station.isFuture) {
      return 'Pendiente';
    }

    if (station.isToday) {
      return station.progress > 0 ? 'En progreso' : 'Pendiente';
    }

    if (station.progress > 0) {
      return 'Parcial';
    }

    return 'Incumplido';
  }

  // Obtener el número de hábitos completados en el día seleccionado.
  getSelectedStationCompletedHabits(): number {

    const station = this.selectedStation;

    if (!station || !this.selectedMissionId) {
      return 0;
    }

    const habits = this.orbitService.getHabitsByMission(
      this.selectedMissionId
    );

    return habits.filter(habit =>
      habit.completedDates.includes(station.dateKey)
    ).length;
  }

  // Obtener el total de hábitos de la misión.
  getSelectedStationTotalHabits(): number {

    if (!this.selectedMissionId) {
      return 0;
    }

    return this.orbitService.getHabitsByMission(
      this.selectedMissionId
    ).length;
  }

  // Obtener el progreso diario de la estación seleccionada.
  getSelectedStationProgress(): number {
    return this.selectedStation?.progress ?? 0;
  }

  // Formatear la fecha de la estación seleccionada.
  formatSelectedStationDate(): string {

    const station = this.selectedStation;

    if (!station) {
      return '';
    }

    const date = new Date(`${station.dateKey}T00:00:00`);

    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  // Generar las doce galaxias del año calendario actual.
  generateMonthlyGalaxies(): void {

    if (!this.selectedMissionId) {
      this.galaxies = [];
      this.selectedGalaxyId = null;
      return;
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ];

    this.galaxies = monthNames.map((monthName, monthIndex) => {

      const start = new Date(currentYear, monthIndex, 1);
      const end = new Date(currentYear, monthIndex + 1, 0);

      const startDate = this.formatDateKey(start);
      const endDate = this.formatDateKey(end);

      const progressData = this.calculateGalaxyProgress(
        startDate,
        endDate,
        monthIndex,
        currentMonth,
        today
      );

      let status: UniverseGalaxy['status'];

      if (progressData.progress >= 100) {
        status = 'completed';
      } else if (monthIndex > currentMonth) {
        status = 'pending';
      } else if (monthIndex === currentMonth) {
        status = 'current';
      } else {
        status = 'incomplete';
      }

      return {
        id: `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}`,
        monthIndex,
        monthName,
        year: currentYear,
        startDate,
        endDate,
        progress: progressData.progress,
        completedHabits: progressData.completedHabits,
        totalHabits: progressData.totalHabits,
        status,
        x: 0,
        y: 0
      };
    });
  }

  // Calcular el progreso de una galaxia según los hábitos cumplidos.
  private calculateGalaxyProgress(
    startDate: string,
    endDate: string,
    monthIndex: number,
    currentMonth: number,
    today: Date
  ): {
    progress: number;
    completedHabits: number;
    totalHabits: number;
  } {

    if (!this.selectedMissionId) {
      return {
        progress: 0,
        completedHabits: 0,
        totalHabits: 0
      };
    }

    const habits = this.orbitService.getHabitsByMission(
      this.selectedMissionId
    );

    if (habits.length === 0 || monthIndex > currentMonth) {
      return {
        progress: 0,
        completedHabits: 0,
        totalHabits: 0
      };
    }

    const effectiveEnd = monthIndex === currentMonth
      ? this.formatDateKey(today)
      : endDate;

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${effectiveEnd}T00:00:00`);

    const elapsedDays =
      Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

    const completedHabits = habits.reduce((total, habit) => {

      const completedDates = new Set(
        habit.completedDates.filter(date =>
          date >= startDate && date <= effectiveEnd
        )
      );

      return total + completedDates.size;

    }, 0);

    const totalHabits = habits.length * elapsedDays;

    return {
      progress: totalHabits > 0
        ? Math.min(
          100,
          Math.round((completedHabits / totalHabits) * 100)
        )
        : 0,
      completedHabits,
      totalHabits
    };
  }

  // Obtener el avance acumulado de la nave por las doce galaxias.
  get monthlyShipProgress(): number {

    if (this.galaxies.length === 0) {
      return 0;
    }

    const totalProgress = this.galaxies.reduce(
      (total, galaxy) => total + galaxy.progress,
      0
    );

    return Math.min(
      100,
      Math.round(totalProgress / 12)
    );
  }

  // Seleccionar o cerrar la información de una galaxia.
  selectGalaxy(galaxyId: string): void {

    this.selectedPlanet = null;
    this.selectedStationId = null;

    this.selectedGalaxyId =
      this.selectedGalaxyId === galaxyId ? null : galaxyId;

    this.cdr.markForCheck();
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
          visualParts: habit.visualParts,
          completed: habit.completedDates.includes(dateKey),
          x: 0,
          y: 0,
          size: 0
        });
      }
    }

    this.dailyPlanets = dailyPlanets;
  }

  // Obtener la imagen de la nave.
  get shipImage(): string {

    if (!this.selectedMission) {
      return '';
    }

    return `assets/Ships/${this.selectedMission.shipType}.png`;
  }

  // Formatear la fecha del planeta seleccionado.
  formatSelectedPlanetDate(): string {

    const planet = this.selectedDailyPlanet;

    if (!planet) {
      return '';
    }

    const date = new Date(`${planet.dateKey}T00:00:00`);

    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }
}

