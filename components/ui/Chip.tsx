import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onClose?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'filled' | 'outlined';
  color?: string;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  onClose,
  icon,
  variant = 'filled',
  color = theme.colors.primary,
  style,
}) => {
  const isOutlined = variant === 'outlined';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isOutlined || !selected ? 'transparent' : color,
          borderColor: color,
          borderWidth: isOutlined ? 1 : 0,
        },
        selected && !isOutlined && styles.selected,
        style,
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={16}
          color={selected && !isOutlined ? theme.colors.text.inverse : color}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          {
            color: selected && !isOutlined ? theme.colors.text.inverse : color,
          },
        ]}
      >
        {label}
      </Text>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons
            name="close-circle"
            size={18}
            color={selected && !isOutlined ? theme.colors.text.inverse : color}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selected: {
    ...theme.shadows.sm,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    marginLeft: 4,
  },
});