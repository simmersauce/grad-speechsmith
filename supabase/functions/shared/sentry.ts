
// Sentry client for Deno Edge Functions
import * as Sentry from "https://deno.land/x/sentry/index.mjs";

/**
 * Initialize Sentry for edge functions
 * @param {string} functionName - The name of the edge function for better error context
 * @returns {Sentry} Sentry client instance
 */
export function initSentry(functionName: string): any {
  // Use the DSN provided by Sentry
  const dsn = Deno.env.get("SENTRY_DSN") || "https://5bbfe738e2feb994db1b2ec7ef02eb23@o4509058089549824.ingest.us.sentry.io/4509058138505216";
  
  try {
    Sentry.init({
      dsn,
      debug: false,
      environment: Deno.env.get("ENVIRONMENT") || "production",
      release: "1.0.0", // You can dynamically set this based on your versioning
      tracesSampleRate: 1.0,
      integrations: [],
      defaultIntegrations: {
        console: false // Disable console as a default integration
      },
      beforeSend(event: any) {
        // Add the function name to all events
        event.tags = event.tags || {};
        event.tags.function = functionName;
        return event;
      },
    });
    
    console.log(`Sentry initialized for function: ${functionName}`);
    
    return Sentry;
  } catch (error) {
    console.error("Failed to initialize Sentry:", error);
    // Return a mock implementation that logs but doesn't throw
    return {
      captureException: (err: any) => {
        console.error(`[${functionName}] Error (Sentry init failed):`, err);
        return "mock-event-id";
      },
      setContext: () => {},
      setTag: () => {},
      setUser: () => {},
      setExtra: () => {},
    };
  }
}
