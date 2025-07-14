// Performance monitoring and optimization utilities

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

export const measurePerformance = async <T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<T> => {
  const start = performance.now();
  
  try {
    const result = await fn();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${name} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ ${name} failed after ${(end - start).toFixed(2)}ms:`, error);
    }
    
    throw error;
  }
};

export const batchUpdates = <T>(
  updateFn: (items: T[]) => void,
  delay: number = 100
) => {
  let batch: T[] = [];
  let timeoutId: NodeJS.Timeout | null = null;

  return (item: T) => {
    batch.push(item);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      updateFn([...batch]);
      batch = [];
      timeoutId = null;
    }, delay);
  };
};

export const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    
    document.head.appendChild(script);
  });
};

export const prefetchResource = (url: string, as: 'script' | 'style' | 'image' | 'fetch' = 'fetch'): void => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = as;
      document.head.appendChild(link);
    });
  }
};

export const lazyLoad = <T>(
  loader: () => Promise<T>,
  fallback?: T
): Promise<T> => {
  if ('requestIdleCallback' in window) {
    return new Promise((resolve, reject) => {
      window.requestIdleCallback(async () => {
        try {
          const result = await loader();
          resolve(result);
        } catch (error) {
          if (fallback !== undefined) {
            resolve(fallback);
          } else {
            reject(error);
          }
        }
      });
    });
  }
  
  return loader();
};
