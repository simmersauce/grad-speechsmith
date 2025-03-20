
// Signature verification module for Stripe webhooks

/**
 * Verifies the Stripe webhook signature using HMAC-SHA256
 * @param payload The raw request body
 * @param signature The signature from the Stripe-Signature header
 * @param secret The webhook secret
 * @returns Whether the signature is valid
 */
export async function verifyStripeSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    // Get timestamp and signatures from the signature header
    const signatureParts = signature.split(',');
    if (signatureParts.length < 2) {
      throw new Error("Invalid signature format");
    }
    
    // Extract the timestamp
    const timestampMatch = signatureParts[0].match(/^t=(\d+)$/);
    if (!timestampMatch) {
      throw new Error("Invalid timestamp in signature");
    }
    const timestamp = timestampMatch[1];
    
    // Extract the signature
    const sigMatch = signatureParts[1].match(/^v1=([a-f0-9]+)$/);
    if (!sigMatch) {
      throw new Error("Invalid signature value");
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
      
    // Compare signatures using a timing-safe comparison
    return timingSafeEqual(computedSignature, expectedSignature);
  } catch (err) {
    console.error("Error verifying signature:", err);
    return false;
  }
}

/**
 * Performs a timing-safe comparison of two strings
 * This helps prevent timing attacks when comparing signatures
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}
