import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Detects elements causing horizontal overflow
 * @returns {Array} Array of elements causing overflow
 */
export function detectHorizontalOverflow() {
  const docWidth = document.documentElement.offsetWidth;
  const elements = [...document.querySelectorAll('*')];
  
  return elements.filter(el => {
    const rect = el.getBoundingClientRect();
    return (rect.left < 0 || rect.right > docWidth);
  });
}

/**
 * Adds a class to the body element to prevent horizontal overflow
 */
export function preventHorizontalOverflow() {
  document.body.style.overflowX = 'hidden';
  document.documentElement.style.overflowX = 'hidden';
}

/**
 * Fixes layout overflow issues that cause white space on the right
 * when scrolling on mobile devices or any viewport.
 * @param {HTMLElement} rootElement - The root element to apply the fix to
 */
export function fixLayoutOverflow(rootElement) {
  // Fix for IE and Chrome horizontal scroll issues
  preventHorizontalOverflow();
  
  if (!rootElement) return;
  
  // Apply overflow handling to both html and body elements
  document.documentElement.style.overflowX = 'hidden';
  document.body.style.overflowX = 'hidden';
  document.body.style.width = '100%';
  
  // Performance optimization for animations
  const animatedElements = document.querySelectorAll('.animate-marquee, .animate-marquee-vertical');
  animatedElements.forEach(el => {
    el.classList.add('low-cpu-animation');
    
    // Add IE fallback class if needed
    if (navigator.userAgent.match(/Trident\/|MSIE/) || navigator.userAgent.match(/Edge\//)) {
      el.classList.add('marquee-fallback');
    }
  });
  
  // Wrap width to viewport width for problematic elements
  const wrapperElements = document.querySelectorAll('.full-width-wrapper');
  wrapperElements.forEach(el => {
    el.style.maxWidth = '100vw';
    el.style.width = '100%';
    el.style.boxSizing = 'border-box';
  });
  
  // Find all potential overflow elements and fix them
  const potentialOverflowElements = rootElement.querySelectorAll('*');
  
  potentialOverflowElements.forEach(element => {
    const styles = window.getComputedStyle(element);
    const width = parseFloat(styles.width);
    const marginLeft = parseFloat(styles.marginLeft);
    const marginRight = parseFloat(styles.marginRight);
    
    // Check if element is wider than viewport or has negative margins
    if (width > window.innerWidth || marginLeft < 0 || marginRight < 0) {
      element.style.maxWidth = '100vw';
      element.style.marginLeft = '0';
      element.style.marginRight = '0';
      element.style.boxSizing = 'border-box';
    }
  });
  
  // Fix for any horizontal scrolling from absolute positioned elements
  const absoluteElements = rootElement.querySelectorAll('[class*="absolute"]');
  absoluteElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      element.style.right = '0';
      element.style.left = 'auto';
    }
  });
}

/**
 * Debugging tool to highlight overflow elements
 * Call in browser console for debugging: highlightOverflowElements()
 */
export function highlightOverflowElements() {
  const elements = detectHorizontalOverflow();
  
  // Reset previous highlights
  document.querySelectorAll('.overflow-highlight').forEach(el => {
    el.classList.remove('overflow-highlight');
    el.style.outline = '';
  });
  
  // Highlight new overflow elements
  elements.forEach(el => {
    el.classList.add('overflow-highlight');
    el.style.outline = '2px solid red';
    console.log('Overflow element:', el);
  });
  
  return elements.length > 0 
    ? `Found ${elements.length} elements causing overflow` 
    : 'No overflow elements detected';
}

/**
 * Applies responsive container constraints to ensure content stays within viewport
 * @param {HTMLElement} container - The container element to constrain
 */
export function applyResponsiveContainer(container) {
  if (!container) return;
  
  container.style.width = '100%';
  container.style.maxWidth = '100vw';
  container.style.overflowX = 'hidden';
  container.style.position = 'relative';
}

/**
 * Monitors and fixes any layout shift issues that might cause horizontal overflow
 * @param {HTMLElement} rootElement - The root element to monitor
 * @returns {Function} Cleanup function to remove event listeners
 */
export function monitorLayoutShift(rootElement) {
  if (!rootElement) return () => {};
  
  const handleResize = () => {
    fixLayoutOverflow(rootElement);
  };
  
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);
  
  // Initial fix
  fixLayoutOverflow(rootElement);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
  };
} 