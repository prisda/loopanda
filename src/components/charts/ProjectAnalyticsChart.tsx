import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Project } from '../../types';
import { format } from 'date-fns';

interface ProjectAnalyticsChartProps {
  project: Project;
  type: 'votes' | 'features' | 'comments';
  title: string;
}

export function ProjectAnalyticsChart({ project, type, title }: ProjectAnalyticsChartProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let collectionRef = collection(db, type === 'comments' ? 'comments' : 'features');
        let q = query(
          collectionRef,
          where('projectId', '==', project.id),
          orderBy('createdAt', 'asc')
        );

        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate()
        }));

        // Group data by date
        const groupedData = items.reduce((acc: any, item: any) => {
          const date = format(item.createdAt, 'yyyy-MM-dd');
          if (!acc[date]) {
            acc[date] = type === 'votes' ? item.votes || 0 : 1;
          } else {
            acc[date] += type === 'votes' ? item.votes || 0 : 1;
          }
          return acc;
        }, {});

        const dates = Object.keys(groupedData);
        const values = Object.values(groupedData);

        // Calculate cumulative values
        const cumulativeValues = values.reduce((acc: number[], value: number) => {
          const lastValue = acc.length > 0 ? acc[acc.length - 1] : 0;
          acc.push(lastValue + value);
          return acc;
        }, []);

        setChartData({
          tooltip: {
            trigger: 'axis',
            formatter: '{b}: {c}'
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
              formatter: (value: string) => format(new Date(value), 'MMM d')
            }
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: title,
              type: 'line',
              smooth: true,
              data: cumulativeValues,
              areaStyle: {
                opacity: 0.1
              },
              lineStyle: {
                width: 3
              },
              itemStyle: {
                color: '#3B82F6'
              }
            }
          ]
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [project.id, type, title]);

  if (loading || !chartData) {
    return <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ReactECharts
        option={chartData}
        style={{ height: '300px' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
}