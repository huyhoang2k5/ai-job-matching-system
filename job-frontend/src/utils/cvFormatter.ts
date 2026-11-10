/**
 * Smart CV Formatter Utility
 * Handles text normalization, section extraction, and typography improvements for raw CV data.
 */

export type CVBlock = {
  type: 'header' | 'list-item' | 'paragraph';
  text: string;
};

export const normalizeCVText = (text: string): string => {
  if (!text) return '';
  let cleaned = text.trim();
  
  // Detect if text is mostly uppercase (loud text)
  const upperCount = (cleaned.match(/[A-Z]/g) || []).length;
  const alphaCount = (cleaned.match(/[a-zA-Z]/g) || []).length;
  
  if (alphaCount > 10 && (upperCount / alphaCount) > 0.7) {
    // Convert to Sentence Case
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  }
  
  return cleaned;
};

export const parseCVDescription = (description: string): CVBlock[] => {
  if (!description) return [];
  
  // Split by newlines or major section breaks
  const rawSegments = description.split(/\n|(?=[A-Z\s]{4,}:)|(?=[A-Z\s]{4,}\s{2,})/);
  const blocks: CVBlock[] = [];
  
  rawSegments.forEach((segment) => {
    let text = segment.trim();
    if (!text) return;
    
    // Normalize case first
    text = normalizeCVText(text);
    
    // Detect Type
    const isHeader = /[A-Z\s]{4,}:?/.test(text) && text.length < 50;
    const isProject = text.toUpperCase().includes('DỰ ÁN') || text.toUpperCase().includes('PROJECT');
    const isListItem = text.startsWith('-') || text.startsWith('•') || /^\d+\./.test(text);
    
    if (isHeader || isProject) {
      blocks.push({ type: 'header', text: text.replace(/:$/, '') });
    } else if (isListItem) {
      blocks.push({ 
        type: 'list-item', 
        text: text.replace(/^[-•]|\d+\.\s*/, '').trim() 
      });
    } else {
      blocks.push({ type: 'paragraph', text });
    }
  });
  
  return blocks;
};
