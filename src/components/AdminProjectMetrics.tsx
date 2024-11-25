import { useState, useEffect } from 'react';
import { BarChart3, Users, ThumbsUp, CheckCircle } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { Project } from '../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AdminProjectMetricsProps {
  project: Project;
}

export function AdminProjectMetrics({ project }: AdminProjectMetricsProps) {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalFeatures: 0,
    totalVotes: 0,
    completedFeatures: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch features for this project
        const featuresQuery = query(
          collection(db, 'features'),
          where('projectId', '==', project.id)
        );
        const featuresSnap = await getDocs(featuresQuery);
        const features = featuresSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calculate metrics
        setMetrics({
          totalUsers: project.members?.length || 0,
          totalFeatures: features.length,
          totalVotes: features.reduce((sum, feature: any) => sum + (feature.votes || 0), 0),
          completedFeatures: features.filter((f: any) => f.status === 'completed').length
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [project]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <MetricCard
        title="Total Users"
        value={metrics.totalUsers}
        icon={Users}
      />
      <MetricCard
        title="Feature Requests"
        value={metrics.totalFeatures}
        icon={BarChart3}
      />
      <MetricCard
        title="Total Votes"
        value={metrics.totalVotes}
        icon={ThumbsUp}
      />
      <MetricCard
        title="Completed Features"
        value={metrics.completedFeatures}
        icon={CheckCircle}
      />
    </div>
  );
}