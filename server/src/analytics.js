export function calculateAnalytics(reports) {
  const total = reports.length;
  const pending = reports.filter(r => r.status !== 'Resolved').length;
  const resolved = reports.filter(r => r.status === 'Resolved').length;
  const highPriorityOpen = reports.filter(r => r.priority === 'High' && r.status !== 'Resolved').length;

  const categoryDist = reports.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});

  const statusDist = reports.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  // Last 7 days distribution
  const dailyCounts = {};
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyCounts[dateStr] = 0;
  }

  reports.forEach(r => {
    const dateStr = r.createdAt.split('T')[0];
    if (dailyCounts[dateStr] !== undefined) {
      dailyCounts[dateStr]++;
    }
  });

  return {
    total,
    pending,
    resolved,
    highPriorityOpen,
    categoryDistribution: categoryDist,
    statusDistribution: statusDist,
    dailyReportCounts: Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  };
}
