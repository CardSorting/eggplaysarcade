import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook for fetching and using Backblaze B2 files with presigned URLs
 * @param filePath The path of the file in B2 (e.g., 'games/123.html')
 * @param enabled Whether to enable the query
 * @returns Object containing file URL and loading state
 */
export function useB2File(filePath: string | null, enabled = true) {
  const [url, setUrl] = useState<string | null>(null);

  // Extract the file type and path
  const getTypeAndPath = () => {
    if (!filePath) return { type: null, path: null };
    
    const parts = filePath.split('/');
    if (parts.length < 2) return { type: null, path: null };
    
    const type = parts[0];
    const path = parts.slice(1).join('/');
    
    return { type, path };
  };

  const { type, path } = getTypeAndPath();
  
  // Query for the presigned URL
  const { data, isLoading, error } = useQuery({
    queryKey: ['b2File', type, path],
    queryFn: async () => {
      if (!type || !path) return null;
      
      const response = await fetch(`/api/files/${type}/${path}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch file URL');
      }
      
      return response.json();
    },
    enabled: enabled && !!type && !!path,
  });

  // Update the URL when data changes
  useEffect(() => {
    if (data?.url) {
      setUrl(data.url);
    }
  }, [data]);

  // Handle direct URLs (not B2 paths)
  useEffect(() => {
    if (filePath && (filePath.startsWith('http://') || filePath.startsWith('https://'))) {
      setUrl(filePath);
    }
  }, [filePath]);

  return {
    url,
    isLoading,
    error
  };
}

/**
 * Custom hook for displaying images from B2
 * @param imagePath The path of the image in B2
 * @returns Props for an img element including src and loading state
 */
export function useB2Image(imagePath: string | null) {
  const { url, isLoading, error } = useB2File(imagePath);
  
  return {
    src: url || '',
    alt: 'Image',
    loading: isLoading ? ('lazy' as const) : undefined,
    className: isLoading ? 'opacity-50' : 'opacity-100',
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      console.error('Failed to load image:', error);
      // Set a fallback image
      e.currentTarget.src = '/assets/image-placeholder.jpg';
    }
  };
}

/**
 * Custom hook for handling game files from B2
 * @param gamePath The path of the game file in B2
 * @returns Object with game URL and loading state
 */
export function useB2Game(gamePath: string | null) {
  const { url, isLoading, error } = useB2File(gamePath);
  
  return {
    gameUrl: url,
    isLoading,
    error
  };
}