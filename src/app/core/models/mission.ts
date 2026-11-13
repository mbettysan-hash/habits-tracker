export interface Mission {
  id: string;
  name: string;
  description?: string;
  color: string;
  habitIds: string[];
  shipType: number;
  createdAt: string;
}