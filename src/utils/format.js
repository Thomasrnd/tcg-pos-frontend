import config from '../config/env';

// Format currency as IDR
export const formatIDR = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format image URL
export const formatImageUrl = (path) => {
  if (!path) return null;
  
  // If the path already includes http, it's an absolute URL
  if (path.startsWith('http')) {
    return path;
  }
  
  // Extract the API base URL (without the /api part)
  const baseUrl = process.env.REACT_APP_BASE_URL || '';
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${normalizedPath}`;
};