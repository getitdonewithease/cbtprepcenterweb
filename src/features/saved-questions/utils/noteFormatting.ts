/**
 * Helper function to render formatted notes with basic markdown and math notation
 * @param text - The input text with markdown and math notation
 * @returns HTML string with formatted content
 */
export const renderFormattedNote = (text: string): string => {
  if (!text) return '';
  
  let html = text
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
    // Superscript (x^2 or x²)
    .replace(/\^(\d+)/g, '<sup>$1</sup>')
    .replace(/([a-zA-Z0-9])²/g, '$1<sup>2</sup>')
    .replace(/([a-zA-Z0-9])³/g, '$1<sup>3</sup>')
    // Subscript (H_2 or H₂)
    .replace(/_(\d+)/g, '<sub>$1</sub>')
    .replace(/([a-zA-Z])₁/g, '$1<sub>1</sub>')
    .replace(/([a-zA-Z])₂/g, '$1<sub>2</sub>')
    .replace(/([a-zA-Z])₃/g, '$1<sub>3</sub>')
    .replace(/([a-zA-Z])₄/g, '$1<sub>4</sub>')
    // Line breaks
    .replace(/\n/g, '<br>');

  return html;
};
