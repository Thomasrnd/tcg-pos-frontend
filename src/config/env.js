// Environment variables configuration
const config = {
    // API URLs
    apiUrl: process.env.REACT_APP_API_URL,
    
    // Other configuration
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  };
  
  export default config;