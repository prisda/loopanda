import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Feature } from '../../types';
import { format, startOfMonth, eachDayOfInterval, subMonths } from 'date-fns';

interface ProjectVotesChartProps {
  features: Feature[];
}

export function ProjectVotesChart({ features }: ProjectVotesChartProps) {
  const chartData = useMemo(() => {
    const endDate = new Date();
    const startDate = startOfMonth(subMonths(endDate, 2));
    const dates = eachDayOfInterval({ start: startDate, end: endDate });

    let cumulativeVotes = 0;
    const votesData = dates.map(date => {
      const dayFeatures = features.filter(feature => {
        const featureDate = feature.createdAt.toDate();
        return format(featureDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });

      cumulativeVotes += dayFeatures.reduce((sum, feature) => sum + (feature.votes || 0), 0);

      return [
        format(date, 'yyyy-MM-dd'),
        cumulativeVotes
      ];
    });

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const date = params[0].value[0];
          const votes = params[0].value[1];
          return `${date}<br/>Total Votes: ${votes}`;
        }
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          formatter: (value: string) => format(new Date(value), 'MMM d')
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        name: 'Cumulative Votes',
        type: 'line',
        data: votesData,
        smooth: true,
        areaStyle: {
          opacity: 0.1
        },
        itemStyle: {
          color: '#3B82F6'
        }
      }]
    };
  }, [features]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Vote Growth</h3>
      <ReactECharts 
        option={chartData}
        style={{ height: '300px' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
}