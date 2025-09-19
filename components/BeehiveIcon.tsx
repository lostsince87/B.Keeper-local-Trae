import React from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

interface BeehiveIconProps {
  size?: number;
  color?: string;
}

export function BeehiveIcon({ size = 24, color = '#000' }: BeehiveIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none"
      >
        {/* Tak (bredare än lådorna, solid) */}
        <Rect x="3.75" y="1.5" width="16.5" height="2.5" rx="0.5" fill={color} />

        {/* Låda 1 */}
        <Rect x="5" y="4.5" width="14" height="7" rx="0.5" stroke={color} strokeWidth="2" fill="none"/>
        {/* Grepp på låda 1 */}
        <Rect x="11" y="7" width="2" height="1" rx="0.5" fill={color} />

        {/* Låda 2 */}
        <Rect x="5" y="11.8" width="14" height="7" rx="0.5" stroke={color} strokeWidth="2" fill="none"/>
        {/* Grepp på låda 2 */}
        <Rect x="11" y="14.3" width="2" height="1" rx="0.5" fill={color} />

        {/* Botten */}
        <Rect x="5" y="19" width="14" height="4" rx="0.5" stroke={color} strokeWidth="2" fill="none"/>

        {/* Fluster (långt, smalt, rundade hörn) */}
        <Rect x="8" y="20.8" width="8" height="1" rx="0.5" fill={color} />
      </Svg>
    </View>
  );
}

// Exportera även som BikupaIcon för bakåtkompatibilitet
export const BikupaIcon = BeehiveIcon;
export default BeehiveIcon;
