/**
 * Sanitizes error messages before showing them to users.
 * Prevents leaking technical details like DB schema, constraint names, etc.
 */

const KNOWN_ERROR_MAP: Record<string, string> = {
  'already registered': 'This email is already registered. Please log in instead.',
  'Invalid login credentials': 'Invalid email or password.',
  'Email not confirmed': 'Please confirm your email address before signing in.',
  'duplicate key': 'This item already exists.',
  'foreign key violation': 'Cannot complete this action: a related record is missing or in use.',
  'violates row-level security': 'You do not have permission to perform this action.',
  'JWT expired': 'Your session has expired. Please sign in again.',
  'refresh_token_not_found': 'Your session has expired. Please sign in again.',
  'User not found': 'Account not found.',
  'rate limit': 'Too many requests. Please try again later.',
  'network': 'Network error. Please check your connection and try again.',
  'Failed to fetch': 'Network error. Please check your connection and try again.',
};

/**
 * Returns a user-safe error message by matching against known patterns.
 * Falls back to a generic message to avoid leaking technical details.
 */
export function getSafeErrorMessage(
  error: unknown,
  fallback = 'An unexpected error occurred. Please try again.'
): string {
  const rawMessage = extractMessage(error);

  for (const [pattern, userMessage] of Object.entries(KNOWN_ERROR_MAP)) {
    if (rawMessage.toLowerCase().includes(pattern.toLowerCase())) {
      return userMessage;
    }
  }

  return fallback;
}

function extractMessage(error: unknown): string {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return '';
}
