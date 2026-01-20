import { useState } from 'react';
import { getFullImageUrl } from '@/lib/utils';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  fallbackSrc?: string;
  alt: string;
  className?: string;
}

/**
 * SafeImage component that handles image loading errors gracefully.
 * Automatically converts relative URLs (from local storage) to full URLs by prepending API base URL.
 * Only shows fallback if the main image fails to load OR if src is empty/null.
 */
export function SafeImage({ src, fallbackSrc, alt, className, ...props }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Convert relative URL to full URL (handles local storage paths like "/uploads/image.jpg")
  const fullImageUrl = getFullImageUrl(src);

  // If no src provided or src is empty, show fallback immediately
  if (!fullImageUrl) {
    return fallbackSrc ? (
      <img src={fallbackSrc} alt={alt} className={className} {...props} />
    ) : (
      <div className={`bg-muted flex items-center justify-center ${className}`} {...props}>
        <span className="text-muted-foreground text-sm">No image</span>
      </div>
    );
  }

  // If image failed to load, show fallback
  if (hasError) {
    return fallbackSrc ? (
      <img src={fallbackSrc} alt={alt} className={className} {...props} />
    ) : (
      <div className={`bg-muted flex items-center justify-center ${className}`} {...props}>
        <span className="text-muted-foreground text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`bg-muted animate-pulse ${className}`} aria-hidden="true" />
      )}
      <img
        src={fullImageUrl}
        alt={alt}
        className={className}
        onLoad={() => setIsLoading(false)}
        onError={(e) => {
          console.warn('⚠️ Image failed to load:', fullImageUrl);
          console.warn('Original URL from API:', src);
          setHasError(true);
          setIsLoading(false);
        }}
        style={{ display: isLoading ? 'none' : 'block' }}
        {...props}
      />
    </>
  );
}
