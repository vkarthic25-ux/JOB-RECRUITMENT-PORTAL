export const formatSalary = (min = 0, max = 0, currency = 'USD') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  });
  if (!min && !max) return 'Competitive';
  if (min && !max) return `${formatter.format(min)}+`;
  if (!min && max) return `Up to ${formatter.format(max)}`;
  return `${formatter.format(min)} - ${formatter.format(max)}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return formatDate(dateString);
};

export const getMatchColor = (percentage) => {
  if (percentage >= 80) return 'emerald';
  if (percentage >= 60) return 'indigo';
  if (percentage >= 40) return 'amber';
  return 'rose';
};
