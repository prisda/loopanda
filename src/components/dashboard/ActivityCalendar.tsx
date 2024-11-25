import { useMemo } from 'react';
import { Feature } from '../../types';
import ReactECharts from 'echarts-for-react';
import { format, eachDayOfInterval, subDays } from 'date-fns';

interface ActivityCalendarProps {
  features: Feature[];
}

export function ActivityCalendar({ features }: ActivityCalendarProps) {
  const calendarData = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 30);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Count features per day
    const activityMap = features.reduce((acc, feature) => {
      const date = format(feature.createdAt.toDate(), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Create data array for ECharts
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      return [dateStr, activityMap[dateStr] || 0];
    });
  }, [features]);

  const option = {
    tooltip: {
      position: 'top',
      formatter: function(params: any) {
        return `${params.value[0]}: ${params.value[1]} features`;
      }
    },
    visualMap: {
      min: 0,
      max: Math.max(...calendarData.map(d => d[1])),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      top: 0,
      inRange: {
        color: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
      }
    },
    calendar: {
      top: 60,
      left: 30,
      right: 30,
      cellSize: ['auto', 20],
      range: [format(subDays(new Date(), 30), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')],
      itemStyle: {
        borderWidth: 0.5
      },
      yearLabel: { show: false }
    },
    series: {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: calendarData
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Calendar</h2>
      <ReactECharts 
        option={option}
        style={{ height: '300px' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}