import type { EventIconDef } from "@/entities/event";
import * as LucideIcons from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

interface Props {
  icon: EventIconDef;
  size?: number;
  color?: string;
}

export function EventIcon({ icon, size = 26, color = "#fff" }: Props) {
  const LucideIcon =
    (LucideIcons[icon.name as keyof typeof LucideIcons] as LucideIcon | undefined) ??
    LucideIcons.Star;
  return <LucideIcon size={size} color={color} />;
}
