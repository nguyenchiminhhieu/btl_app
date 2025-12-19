import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';

interface LineChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity?: number) => string;
      strokeWidth?: number;
    }>;
  };
  width: number;
  height: number;
  chartConfig: any;
  bezier?: boolean;
  style?: any;
  withDots?: boolean;
  withShadow?: boolean;
  withVerticalLabels?: boolean;
  withHorizontalLabels?: boolean;
  fromZero?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  width,
  height,
  chartConfig,
  style,
  bezier = true,
  withDots = true,
  withShadow = false,
  withVerticalLabels = true,
  withHorizontalLabels = true,
  fromZero = false,
}) => {
  // Check for valid data
  const values = data.datasets[0]?.data || [];
  const labels = data.labels || [];
  
  if (values.length === 0 || values.every(v => v === 0)) {
    return (
      <View style={[styles.container, style, { width, height }]}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Chưa có dữ liệu biểu đồ</Text>
        </View>
      </View>
    );
  }

  // Calculate chart dimensions
  const paddingTop = 30;
  const paddingBottom = 50;
  const paddingLeft = 60;
  const paddingRight = 20;
  
  const chartArea = {
    width: width - paddingLeft - paddingRight,
    height: height - paddingTop - paddingBottom,
  };

  // Calculate min/max values for scaling
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const valueRange = maxValue - minValue || 1;

  // Generate points
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * chartArea.width;
    const y = chartArea.height - ((value - minValue) / valueRange) * chartArea.height;
    return { x, y, value };
  });

  // Get colors from config
  const lineColor = data.datasets[0]?.color?.(1) || chartConfig?.color?.(1) || '#3B82F6';
  const labelColor = chartConfig?.labelColor?.(0.7) || '#4B5563';

  // Generate grid lines data
  const gridLines = [];
  const numGridLines = 4;
  for (let i = 0; i <= numGridLines; i++) {
    const value = maxValue - (i / numGridLines) * valueRange;
    gridLines.push({ value });
  }

  return (
    <View style={[styles.container, style, { width, height }]}>
      {/* Chart Background */}
      <View style={[styles.chartBackground, { width, height }]}>
        
        {/* Grid Lines */}
        <View style={[styles.gridContainer, { top: paddingTop, left: paddingLeft, width: chartArea.width, height: chartArea.height }]}>
          {gridLines.map((line, index) => (
            <View key={index} style={[styles.gridLine, { top: (index / numGridLines) * chartArea.height }]} />
          ))}
        </View>

        {/* Y-axis Labels */}
        {withVerticalLabels && (
          <View style={[styles.yAxisContainer, { top: paddingTop, left: 10, height: chartArea.height }]}>
            {gridLines.map((line, index) => (
              <Text 
                key={index} 
                style={[
                  styles.yAxisLabel, 
                  { 
                    top: (index / numGridLines) * chartArea.height - 8,
                    color: labelColor 
                  }
                ]}
              >
                {line.value.toFixed(1)}
              </Text>
            ))}
          </View>
        )}

        {/* Chart Area */}
        <View style={[styles.chartArea, { top: paddingTop, left: paddingLeft, width: chartArea.width, height: chartArea.height }]}>
          
          {/* Line Segments */}
          {points.map((point, index) => {
            if (index === points.length - 1) return null;
            const nextPoint = points[index + 1];
            const lineWidth = Math.sqrt(
              Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2)
            );
            const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
            
            return (
              <View
                key={`line-${index}`}
                style={[
                  styles.lineSegment,
                  {
                    position: 'absolute',
                    left: point.x,
                    top: point.y,
                    width: lineWidth,
                    height: 3,
                    backgroundColor: lineColor,
                    transform: [{ rotate: `${angle}deg` }],
                    transformOrigin: '0 50%',
                  }
                ]}
              />
            );
          })}

          {/* Data Points */}
          {withDots && points.map((point, index) => (
            <View
              key={`dot-${index}`}
              style={[
                styles.dataPoint,
                {
                  position: 'absolute',
                  left: point.x - 6,
                  top: point.y - 6,
                  backgroundColor: '#ffffff',
                  borderColor: lineColor,
                }
              ]}
            />
          ))}
        </View>

        {/* X-axis Labels */}
        {withHorizontalLabels && (
          <View style={[styles.xAxisContainer, { top: paddingTop + chartArea.height + 10, left: paddingLeft, width: chartArea.width }]}>
            {labels.map((label, index) => (
              <Text 
                key={index} 
                style={[
                  styles.xAxisLabel, 
                  { 
                    position: 'absolute',
                    left: (index / Math.max(labels.length - 1, 1)) * chartArea.width - 20,
                    color: labelColor 
                  }
                ]}
              >
                {label}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartBackground: {
    position: 'relative',
    backgroundColor: '#ffffff',
    borderRadius: 16,
  },
  gridContainer: {
    position: 'absolute',
  },
  gridLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#e5e7eb',
    opacity: 0.6,
  },
  yAxisContainer: {
    position: 'absolute',
    width: 45,
  },
  yAxisLabel: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
    width: 40,
  },
  xAxisContainer: {
    position: 'absolute',
    height: 30,
  },
  xAxisLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    width: 40,
  },
  chartArea: {
    position: 'absolute',
  },
  lineSegment: {
    borderRadius: 1.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  dataPoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});