import type { EventType } from "@/entities/event";
import * as LucideIcons from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

const ICON_FOR_TYPE: Record<EventType, string> = {
  cercavila: "Flag",
  correfoc: "Flame",
  concert: "Music",
  sardanes: "Music2",
  castellera: "Users",
  gegants: "Crown",
  exposicio: "Image",
  espectacle: "Theater",
  missa: "Church",
  focsartificials: "Sparkles",
  cursa: "Footprints",
  jocs: "Gamepad2",
  contes: "BookOpen",
  altres: "MapPin",
};

interface Props {
  type: EventType;
  size?: number;
  color?: string;
}

export function EventIcon({ type, size = 26, color = "#fff" }: Props) {
  const iconName = ICON_FOR_TYPE[type] ?? "MapPin";
  const Icon =
    (LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon | undefined) ??
    LucideIcons.MapPin;
  return <Icon size={size} color={color} />;
}
