
// Sentry client for Deno Edge Functions
import { Toucan } from "https://esm.sh/@sentry/toucan@0.1.3";

/**
 * Initialize Sentry for edge functions
 * @param {string} functionName - The name of the edge function for better error context
 * @returns {Toucan} Sentry client instance
 */
export function initSentry(functionName: string): Toucan {
  const dsn = Deno.env.get("SENTRY_DSN");
  
  // Check if DSN is configured
  if (!dsn) {
    console.warn("SENTRY_DSN is not configured. Error tracking is disabled.");
    // Return a mock implementation that does nothing
    return {
      captureException: (err: any) => {
        console.error(`[${functionName}] Error (not sent to Sentry):`, err);
        return "mock-event-id";
      },
      setContext: () => {},
      setTag: () => {},
      setUser: () => {},
      setExtra: () => {},
    } as unknown as Toucan;
  }
  
  try {
    return new Toucan({
      dsn,
      debug: false,
      environment: Deno.env.get("ENVIRONMENT") || "production",
      release: "1.0.0", // You can dynamically set this based on your versioning
      tags: {
        function: functionName,
      },
    });
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
    } as unknown as Toucan;
  }
}
