const STATS = [
  { label: 'Active Projects', value: '2,500+' },
  { label: 'Feature Requests', value: '50,000+' },
  { label: 'Happy Users', value: '100,000+' },
  { label: 'Implementation Rate', value: '85%' }
];

export function StatsSection() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 sm:px-8 lg:px-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map(stat => (
          <div key={stat.label} className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
            <div className="text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}