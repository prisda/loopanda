import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Project } from '../types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AdminProjectAnalyticsProps {
  project: Project;
}

export function AdminProjectAnalytics({ project }: AdminProjectAnalyticsProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const featuresQuery = query(
          collection(db, 'features'),
          where('projectId', '==', project.id),
          orderBy('createdAt', 'asc')
        );
        
        const snapshot = await getDocs(featuresQuery);
        const features = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Process data for chart
        const dates = features.map((f: any) => 
          new Date(f.createdAt.toDate()).toLocaleDateString()
        );
        const votes = features.map((f: any) => f.votes || 0);

        setChartData({
          labels: dates,
          datasets: [
            {
              label: 'Votes',
              data: votes,
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              tension: 0.4
            }
          ]
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [project]);

  if (loading || !chartData) {
    return (
      <div className="h-64 bg-white rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Vote Trends</h3>
      <div className="h-64">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }}
        />
      </div>
    </div>
  );
}