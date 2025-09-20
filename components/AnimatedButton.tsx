import React, { useRef } from 'react';
import { Pressable, Animated, ViewStyle, PressableProps } from 'react-native';

interface AnimatedButtonProps extends PressableProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  scaleValue?: number; // Hur mycket knappen ska skala ner (0.9 = 90%)
  duration?: number; // Animationens varaktighet i ms
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  style,
  scaleValue = 0.92, // Standard 92% skala för subtil effekt
  duration = 150, // Standard 150ms för responsiv känsla
  onPressIn,
  onPressOut,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (event: any) => {
    // Animera ner till skalvärdet
    Animated.timing(scaleAnim, {
      toValue: scaleValue,
      duration: duration,
      useNativeDriver: true,
    }).start();
    
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    // Animera tillbaka till normal storlek
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: true,
    }).start();
    
    onPressOut?.(event);
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Pressable
        style={style}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};