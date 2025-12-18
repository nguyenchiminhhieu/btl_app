import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { DesignTokens } from '../../constants/design-tokens';

/**
 * Layout Components - Consistent spacing and structure
 * 
 * COMPONENTS:
 * - Container: Max width wrapper with horizontal padding
 * - VStack: Vertical stack with gap
 * - HStack: Horizontal stack with gap
 * - Spacer: Flexible spacer for flex layouts
 * - Divider: Horizontal/vertical divider line
 * 
 * USAGE:
 * <Container>
 *   <VStack gap="lg">
 *     <Card>...</Card>
 *     <Card>...</Card>
 *   </VStack>
 * </Container>
 */

const { width: screenWidth } = Dimensions.get('window');

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  contentContainerStyle?: ViewStyle;
}

interface StackProps {
  children: React.ReactNode;
  gap?: keyof typeof DesignTokens.spacing;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  style?: ViewStyle;
}

interface HStackProps extends StackProps {
  wrap?: boolean;
}

interface SpacerProps {
  width?: number;
  height?: number;
  flex?: number;
}

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  color?: string;
  thickness?: number;
  style?: ViewStyle;
}

// CONTAINER - Screen wrapper with max width and padding
export const Container: React.FC<ContainerProps> = ({ 
  children, 
  style, 
  scrollable = false,
  contentContainerStyle,
}) => {
  const containerStyle: ViewStyle = {
    flex: 1,
    maxWidth: DesignTokens.layout.containerMaxWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: DesignTokens.layout.screenPadding.horizontal,
  };

  if (scrollable) {
    return (
      <ScrollView 
        style={[containerStyle, style]}
        contentContainerStyle={[
          { paddingVertical: DesignTokens.layout.screenPadding.vertical },
          contentContainerStyle
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      {children}
    </View>
  );
};

// VSTACK - Vertical stack with gap
export const VStack: React.FC<StackProps> = ({ 
  children, 
  gap = 'md', 
  align = 'stretch', 
  justify = 'flex-start',
  style,
}) => (
  <View 
    style={[
      {
        flexDirection: 'column',
        alignItems: align,
        justifyContent: justify,
        gap: DesignTokens.spacing[gap],
      },
      style
    ]}
  >
    {children}
  </View>
);

// HSTACK - Horizontal stack with gap
export const HStack: React.FC<HStackProps> = ({ 
  children, 
  gap = 'md', 
  align = 'center', 
  justify = 'flex-start',
  wrap = false,
  style,
}) => (
  <View 
    style={[
      {
        flexDirection: 'row',
        alignItems: align,
        justifyContent: justify,
        gap: DesignTokens.spacing[gap],
        flexWrap: wrap ? 'wrap' : 'nowrap',
      },
      style
    ]}
  >
    {children}
  </View>
);

// SPACER - Flexible space
export const Spacer: React.FC<SpacerProps> = ({ width, height, flex = 1 }) => (
  <View 
    style={{
      width,
      height,
      flex: width || height ? undefined : flex,
    }} 
  />
);

// DIVIDER - Separator line
export const Divider: React.FC<DividerProps> = ({ 
  orientation = 'horizontal', 
  color = DesignTokens.colors.neutral[200],
  thickness = 1,
  style,
}) => {
  const dividerStyle: ViewStyle = orientation === 'horizontal' 
    ? { height: thickness, backgroundColor: color }
    : { width: thickness, backgroundColor: color };

  return <View style={[dividerStyle, style]} />;
};

// GRID - Simple grid layout for cards
interface GridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: keyof typeof DesignTokens.spacing;
  style?: ViewStyle;
}

export const Grid: React.FC<GridProps> = ({ 
  children, 
  columns = 2, 
  gap = 'md',
  style,
}) => {
  const childrenArray = React.Children.toArray(children);
  const rows = [];
  
  for (let i = 0; i < childrenArray.length; i += columns) {
    const rowChildren = childrenArray.slice(i, i + columns);
    rows.push(
      <HStack key={i} gap={gap} style={{ flex: 1 }}>
        {rowChildren.map((child, index) => (
          <View key={index} style={{ flex: 1 }}>
            {child}
          </View>
        ))}
        {/* Fill remaining space if row is not complete */}
        {rowChildren.length < columns && 
          Array.from({ length: columns - rowChildren.length }, (_, index) => (
            <View key={`spacer-${index}`} style={{ flex: 1 }} />
          ))
        }
      </HStack>
    );
  }

  return (
    <VStack gap={gap} style={style}>
      {rows}
    </VStack>
  );
};

// SECTION - Content section with optional header
interface SectionProps {
  children: React.ReactNode;
  title?: string;
  headerComponent?: React.ReactNode;
  gap?: keyof typeof DesignTokens.spacing;
  style?: ViewStyle;
}

export const Section: React.FC<SectionProps> = ({ 
  children, 
  title, 
  headerComponent,
  gap = 'md',
  style,
}) => (
  <VStack gap={gap} style={style}>
    {(title || headerComponent) && (
      <View>
        {headerComponent || (
          title && (
            <Text style={styles.sectionTitle}>{title}</Text>
          )
        )}
      </View>
    )}
    {children}
  </VStack>
);

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: DesignTokens.typography.size.xl,
    fontWeight: DesignTokens.typography.weight.semibold,
    color: DesignTokens.colors.neutral[900],
    marginBottom: DesignTokens.spacing.sm,
  },
});