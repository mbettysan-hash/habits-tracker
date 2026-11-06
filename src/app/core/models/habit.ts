export interface Habit {
  id: string;
  missionId: string;
  name: string;
  emoji: string;
  color: string;
  planetType: number;
  completedDates: string[];
  createdAt: string;
}