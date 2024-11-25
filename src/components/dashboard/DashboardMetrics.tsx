import { useMemo } from 'react';
import { Feature } from '../../types';
import { BarChart3, ThumbsUp, MessageSquare, Users } from 'lucide-react';
import { MetricCard } from '../MetricCard';
import { subDays } from 'date-fns';

interface DashboardMetricsProps {
  features: Feature[];
}

export function DashboardMetrics({ features }: DashboardMetricsProps) {
  const metrics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sevenDaysAgo = subDays(now, 7);

    const recentFeatures = features.filter(f => 
      f.createdAt.toDate() >= sevenDaysAgo
    );

    const totalVotes = features.reduce((sum, f) => sum + (f.votes || 0), 0);
    const totalComments = features.reduce((sum, f) => sum + (f.commentCount || 0), 0);

    const uniqueContributors = new Set(
      features.map(f => f.createdBy)
    ).size;

    return {
      newFeatures: recentFeatures.length,
      totalVotes,
      totalComments,
      uniqueContributors
    };
  }, [features]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="New Features"
        value={metrics.newFeatures}
        icon={BarChart3}
        trend={{
          value: metrics.newFeatures,
          isPositive: true,
          label: 'last 7 days'
        }}
      />
      <MetricCard
        title="Total Votes"
        value={metrics.totalVotes}
        icon={ThumbsUp}
      />
      <MetricCard
        title="Total Comments"
        value={metrics.totalComments}
        icon={MessageSquare}
      />
      <MetricCard
        title="Contributors"
        value={metrics.uniqueContributors}
        icon={Users}
      />
    </div>
  );
}