
// Signature verification module for Stripe webhooks

/**
 * Verifies the Stripe webhook signature using HMAC-SHA256
 */
export async function verifyStripeSignature(payload, signature, secret) {
  try {
    // Get timestamp and signatures from the signature header
    const signatureParts = signature.split(',');
    if (signatureParts.length < 2) {
      throw new Error(`Invalid signature format: expected at least 2 parts, got ${signatureParts.length}`);
    }
    
    // Extract the timestamp
    const timestampMatch = signatureParts[0].match(/^t=(\d+)$/);
    if (!timestampMatch) {
      throw new Error(`Invalid timestamp format in signature: ${signatureParts[0]}`);
    }
    const timestamp = timestampMatch[1];
    
    // Log timestamp for debugging
    console.log(`Signature timestamp: ${timestamp}`);
    
    // Check if the timestamp is too old (tolerance of 5 minutes)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timestampNum = parseInt(timestamp);
    const tolerance = 5 * 60; // 5 minutes in seconds
    
    if (Math.abs(currentTimestamp - timestampNum) > tolerance) {
      console.warn(`Timestamp is outside of tolerance window: ${timestamp} vs ${currentTimestamp}`);
      // We'll still continue to check the signature, but log this as a warning
    }
    
    // Extract the signature
    const sigMatch = signatureParts[1].match(/^v1=([a-f0-9]+)$/);
    if (!sigMatch) {
      throw new Error(`Invalid signature value format: ${signatureParts[1]}`);
    }
    const expectedSignature = sigMatch[1];
    
    // Create a string to sign
    const signedPayload = `${timestamp}.${payload}`;
    
    // Decode the webhook secret to a Uint8Array
    const key = new TextEncoder().encode(secret);
    
    // Encode the payload
    const message = new TextEncoder().encode(signedPayload);
    
    // Create HMAC-SHA256
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    // Sign the payload
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      message
    );
    
    // Convert to hex string
    const signatureBytes = new Uint8Array(signatureBuffer);
    const computedSignature = Array.from(signatureBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
      
    // Log signature details for debugging, but don't reveal full values
    console.log(`Expected signature length: ${expectedSignature.length}`);
    console.log(`Computed signature length: ${computedSignature.length}`);
    console.log(`First 6 chars - Expected: ${expectedSignature.substring(0, 6)}, Computed: ${computedSignature.substring(0, 6)}`);
    console.log(`Last 6 chars - Expected: ${expectedSignature.slice(-6)}, Computed: ${computedSignature.slice(-6)}`);
      
    // Compare signatures using a timing-safe comparison
    const isEqual = timingSafeEqual(computedSignature, expectedSignature);
    console.log(`Signature verification result: ${isEqual ? 'Valid' : 'Invalid'}`);
    return isEqual;
  } catch (err) {
    console.error("Error in signature verification process:", err);
    console.error("Stack trace:", err.stack || "No stack trace available");
    throw err; // Re-throw to be handled by the caller
  }
}

/**
 * Performs a timing-safe comparison of two strings
 * This helps prevent timing attacks when comparing signatures
 */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    console.log(`Length mismatch: ${a.length} vs ${b.length}`);
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}
