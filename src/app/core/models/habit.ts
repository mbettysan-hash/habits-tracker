
export interface Habit {
  id: string;
  missionId: string;
  name: string;
  emoji: string;
  color: string;
  planetType: number;

  // Recursos visuales Kenney asignados al planeta
  visualParts?: {
    lights: string[];
    noises: string[];
    spheres: string[];
  };

  completedDates: string[];
  createdAt: string;
}
