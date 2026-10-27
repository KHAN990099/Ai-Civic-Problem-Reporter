import Fuse from 'fuse.js';

export function detectDuplicates(reports, newReport) {
  // Filter reports in the same category
  const sameCategory = reports.filter(r => r.category === newReport.category);
  
  if (sameCategory.length === 0) return [];

  const fuse = new Fuse(sameCategory, {
    keys: ['description', 'location'],
    threshold: 0.3, // Lower is stricter
  });

  const results = fuse.search(newReport.description);
  
  return results
    .filter(res => res.score < 0.4)
    .map(res => ({
      id: res.item.id,
      score: res.score,
      description: res.item.description,
      location: res.item.location
    }));
}
