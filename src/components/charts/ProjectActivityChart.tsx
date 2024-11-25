import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Feature } from '../../types';
import { format, startOfMonth, eachDayOfInterval, subMonths } from 'date-fns';

interface ProjectActivityChartProps {
  features: Feature[];
}

export function ProjectActivityChart({ features }: ProjectActivityChartProps) {
  const chartData = useMemo(() => {
    const endDate = new Date();
    const startDate = startOfMonth(subMonths(endDate, 2));
    const dates = eachDayOfInterval({ start: startDate, end: endDate });

    const activityData = dates.map(date => {
      const dayFeatures = features.filter(feature => {
        const featureDate = feature.createdAt.toDate();
        return format(featureDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });

      return [
        format(date, 'yyyy-MM-dd'),
        dayFeatures.length
      ];
    });

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const date = params[0].value[0];
          const count = params[0].value[1];
          return `${date}<br/>Features: ${count}`;
        }
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          formatter: (value: string) => format(new Date(value), 'MMM d')
        }
      },
      yAxis: {
        type: 'value',
        minInterval: 1
      },
      series: [{
        name: 'Daily Activity',
        type: 'bar',
        data: activityData,
        itemStyle: {
          color: '#3B82F6'
        }
      }]
    };
  }, [features]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity</h3>
      <ReactECharts 
        option={chartData}
        style={{ height: '300px' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
}