import { OAuth2Client } from 'google-auth-library';

// Replace with your actual Google Client ID
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// Initialize the OAuth2 client
const client = new OAuth2Client(CLIENT_ID);

// Define an interface for the function's return type
interface VerifyResult {
  valid: boolean;
  payload?: Record<string, any>;
  error?: string;
}

/**
 * Verifies a Google ID token.
 * @param {string} idToken - The ID token to verify.
 * @returns {Promise<VerifyResult>} - A promise that resolves to the verification result.
 */
export async function verifyGoogleToken(
  idToken: string
): Promise<VerifyResult> {
  try {
    // Verify the ID token
    console.log('CLIENT_ID: ', CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
    });
    // Get the payload (user information) from the verified token
    const payload = ticket.getPayload();

    // Return the user information
    return {
      valid: true,
      payload: payload
    };
  } catch (error) {
    // Handle the error
    return {
      valid: false,
      error: (error as Error).message
    };
  }
}
