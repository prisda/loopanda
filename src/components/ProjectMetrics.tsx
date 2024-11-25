import { useMemo } from 'react';
import { Project, Feature } from '../types';
import { Users, ThumbsUp, CheckCircle, BarChart3 } from 'lucide-react';
import { MetricCard } from './MetricCard';

interface ProjectMetricsProps {
  project: Project;
  features: Feature[];
}

export function ProjectMetrics({ project, features }: ProjectMetricsProps) {
  const metrics = useMemo(() => {
    const totalVotes = features.reduce((sum, feature) => sum + (feature.votes || 0), 0);
    const completedFeatures = features.filter(f => f.status === 'completed').length;
    const inProgressFeatures = features.filter(f => f.status === 'in-progress').length;

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const recentFeatures = features.filter(f => 
      f.createdAt.toDate() > monthAgo
    ).length;

    return {
      totalFeatures: features.length,
      totalVotes,
      completedFeatures,
      activeFeatures: inProgressFeatures,
      monthlyGrowth: recentFeatures
    };
  }, [features]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Features"
        value={metrics.totalFeatures}
        icon={BarChart3}
        trend={{
          value: metrics.monthlyGrowth,
          isPositive: true,
          label: 'new this month'
        }}
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
        trend={{
          value: Math.round((metrics.completedFeatures / metrics.totalFeatures) * 100),
          isPositive: true,
          label: 'completion rate'
        }}
      />
      <MetricCard
        title="Active Features"
        value={metrics.activeFeatures}
        icon={Users}
      />
    </div>
  );
}