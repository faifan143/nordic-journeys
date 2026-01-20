import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a relative image URL to a full URL by prepending the API base URL.
 * Handles both relative URLs (from local storage) and absolute URLs (from seed data/Backblaze).
 * 
 * @param url - Image URL (can be relative like "/uploads/image.jpg" or absolute like "https://...")
 * @returns Full image URL or null if input is empty/null
 */
export function getFullImageUrl(url: string | null | undefined): string | null {
  if (!url || url.trim() === '') {
    return null;
  }
  
  const trimmedUrl = url.trim();
  
  // If it's already an absolute URL (http/https), return as-is
  // This handles seed data URLs (picsum.photos) and any remaining Backblaze URLs
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }
  
  // If it's a relative URL (starts with /), prepend API base URL
  if (trimmedUrl.startsWith('/')) {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${API_BASE_URL}${trimmedUrl}`;
  }
  
  // If it doesn't start with /, assume it's relative and prepend API URL + /
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${API_BASE_URL}/${trimmedUrl}`;
}