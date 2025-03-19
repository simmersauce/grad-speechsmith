
/**
 * Utility for tracking user button clicks
 */

// Track button clicks by sending to console (can be replaced with actual analytics later)
export const trackButtonClick = (buttonName: string, additionalData?: Record<string, any>) => {
  console.log(`Button Clicked: ${buttonName}`, additionalData || {});
  
  // This is where you would integrate with an analytics service
  // Example: sendToAnalytics('button_click', { button: buttonName, ...additionalData });
};
