import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import type { EventIconDef } from '@/entities/event';

interface Props {
  icon: EventIconDef;
  size?: number;
  color?: string;
}

export function EventIcon({ icon, size = 26, color = '#fff' }: Props) {
  if (icon.lib === 'MaterialCommunityIcons') {
    return (
      <MaterialCommunityIcons
        name={icon.name as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
        size={size}
        color={color}
      />
    );
  }
  return (
    <Ionicons
      name={icon.name as React.ComponentProps<typeof Ionicons>['name']}
      size={size}
      color={color}
    />
  );
}
