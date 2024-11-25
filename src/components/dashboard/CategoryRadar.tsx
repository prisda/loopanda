import { useMemo } from 'react';
import { Feature } from '../../types';
import ReactECharts from 'echarts-for-react';

interface CategoryRadarProps {
  features: Feature[];
}

export function CategoryRadar({ features }: CategoryRadarProps) {
  const radarData = useMemo(() => {
    if (!features.length) return { categories: [], featureCounts: [], voteCounts: [] };

    // Count features and votes per category
    const categoryStats = features.reduce((acc, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = { count: 0, votes: 0 };
      }
      acc[feature.category].count++;
      acc[feature.category].votes += feature.votes || 0;
      return acc;
    }, {} as Record<string, { count: number; votes: number }>);

    const categories = Object.keys(categoryStats);
    const featureCounts = categories.map(cat => categoryStats[cat].count);
    const voteCounts = categories.map(cat => categoryStats[cat].votes);

    return {
      categories,
      featureCounts,
      voteCounts
    };
  }, [features]);

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['Features', 'Votes'],
      bottom: 0
    },
    radar: {
      indicator: radarData.categories.map(category => ({
        name: category,
        max: Math.max(
          Math.max(...radarData.featureCounts, 1),
          Math.max(...radarData.voteCounts, 1)
        )
      })),
      center: ['50%', '50%'],
      radius: '60%'
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: radarData.featureCounts,
          name: 'Features',
          itemStyle: { color: '#3B82F6' }
        },
        {
          value: radarData.voteCounts,
          name: 'Votes',
          itemStyle: { color: '#10B981' }
        }
      ]
    }]
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h2>
      {radarData.categories.length > 0 ? (
        <ReactECharts 
          option={option}
          style={{ height: '300px' }}
          opts={{ renderer: 'canvas' }}
        />
      ) : (
        <p className="text-center text-gray-500 py-12">No data available</p>
      )}
    </div>
  );
}