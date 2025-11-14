import { House } from "@/types";

export const HOUSES: House[] = [
  {
    id: "akashic",
    name: "Akashic Warriors",
    emoji: "⚔️",
    logo: "/akashic_warriors.png",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-500",
  },
  {
    id: "karma",
    name: "Karma Debuggers",
    emoji: "🐛",
    logo: "/karma_debuggers.png",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500",
  },
  {
    id: "zen",
    name: "Zen Coders",
    emoji: "🧘",
    logo: "/zen_coders.png",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-500",
  },
  {
    id: "shakti",
    name: "Shakti Compilers",
    emoji: "⚡",
    logo: "/shakti_compilers.png",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-500",
  },
];

export function getHouseById(id: string): House | undefined {
  return HOUSES.find((house) => house.name === id);
}

