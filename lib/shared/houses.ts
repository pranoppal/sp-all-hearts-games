import { House } from "@/types";

export const HOUSES: House[] = [
  {
    id: "fire",
    name: "Fire",
    emoji: "🔥",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-500",
  },
  {
    id: "water",
    name: "Water",
    emoji: "💧",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500",
  },
  {
    id: "earth",
    name: "Earth",
    emoji: "🌿",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-500",
  },
  {
    id: "air",
    name: "Air",
    emoji: "💨",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-500",
  },
];

export function getHouseById(id: string): House | undefined {
  return HOUSES.find((house) => house.id === id);
}

