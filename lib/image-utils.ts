/**
 * Converts a storage path to a full Supabase public URL
 * Handles both relative paths and already-complete URLs
 */
export function getImageUrl(storagePath: string): string {
    // If it's already a full URL, return as-is
    if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
      return storagePath;
    }
    
    // If it starts with a slash, it's a relative path from domain root
    if (storagePath.startsWith('/')) {
      return storagePath;
    }
    
    // Otherwise, construct the full Supabase storage URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      console.error('NEXT_PUBLIC_SUPABASE_URL not found');
      return storagePath;
    }
    
    // Remove trailing slash from supabase URL if present
    const baseUrl = supabaseUrl.replace(/\/$/, '');
    
    // For Supabase storage, the format is: {supabase_url}/storage/v1/object/public/{bucket}/{path}
    return `${baseUrl}/storage/v1/object/public/stories/${storagePath}`;
  }