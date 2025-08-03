import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bold, 
  Italic, 
  Superscript, 
  Subscript,
  Calculator,
  FlaskConical,
  Type,
  Eye,
  Edit
} from 'lucide-react';

interface SimpleMathEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

const SimpleMathEditor: React.FC<SimpleMathEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter your note here...",
  rows = 6,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end);
    
    onChange(newText);
    
    // Set cursor position after insert
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  // Convert simple markdown and math to HTML
  const renderPreview = (text: string) => {
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

  const mathButtons = [
    {
      label: 'Power',
      icon: <Superscript className="h-4 w-4" />,
      action: () => insertText('x^', '', '2'),
      tooltip: 'Superscript: x^2 or x²'
    },
    {
      label: 'Subscript', 
      icon: <Subscript className="h-4 w-4" />,
      action: () => insertText('H_', '', '2'),
      tooltip: 'Subscript: H_2 or H₂'
    },
    {
      label: 'Fraction',
      icon: <Calculator className="h-4 w-4" />,
      action: () => insertText('(', ')', 'a/b'),
      tooltip: 'Fraction: (a/b)'
    },
    {
      label: 'Chemical',
      icon: <FlaskConical className="h-4 w-4" />,
      action: () => insertText('H_2SO_4', '', ''),
      tooltip: 'Chemical formula: H₂SO₄'
    }
  ];

  const formatButtons = [
    {
      label: 'Bold',
      icon: <Bold className="h-4 w-4" />,
      action: () => insertText('**', '**', 'bold text'),
      tooltip: 'Bold: **text**'
    },
    {
      label: 'Italic',
      icon: <Italic className="h-4 w-4" />,
      action: () => insertText('*', '*', 'italic text'),
      tooltip: 'Italic: *text*'
    },
    {
      label: 'Code',
      icon: <Type className="h-4 w-4" />,
      action: () => insertText('`', '`', 'code'),
      tooltip: 'Inline code: `code`'
    }
  ];

  const symbolButtons = [
    { symbol: '²', label: 'x²' },
    { symbol: '³', label: 'x³' },
    { symbol: '₁', label: 'x₁' },
    { symbol: '₂', label: 'x₂' },
    { symbol: '₃', label: 'x₃' },
    { symbol: '₄', label: 'x₄' },
    { symbol: 'α', label: 'Alpha' },
    { symbol: 'β', label: 'Beta' },
    { symbol: 'γ', label: 'Gamma' },
    { symbol: 'Δ', label: 'Delta' },
    { symbol: '∑', label: 'Sum' },
    { symbol: '∫', label: 'Integral' },
    { symbol: '√', label: 'Root' },
    { symbol: '∞', label: 'Infinity' },
    { symbol: '±', label: 'Plus/minus' },
    { symbol: '≤', label: 'Less equal' },
    { symbol: '≥', label: 'Greater equal' },
    { symbol: '≠', label: 'Not equal' }
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
          
          {activeTab === 'edit' && (
            <div className="text-xs text-muted-foreground">
              {value.length}/1000 characters
            </div>
          )}
        </div>

        <TabsContent value="edit" className="space-y-3">
          {/* Formatting Toolbar */}
          <Card className="p-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">Format:</span>
                {formatButtons.map((button, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={button.action}
                    title={button.tooltip}
                    className="h-8 w-8 p-0"
                  >
                    {button.icon}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">Math:</span>
                {mathButtons.map((button, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={button.action}
                    title={button.tooltip}
                    className="h-8 w-8 p-0"
                  >
                    {button.icon}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">Symbols:</span>
                {symbolButtons.map((button, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => insertText(button.symbol, '', '')}
                    title={button.label}
                    className="h-8 w-8 p-0 text-sm"
                  >
                    {button.symbol}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Text Area */}
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="resize-none"
          />

          {/* Quick Reference */}
          <Card className="p-3 bg-muted/30">
            <div className="text-xs space-y-1">
              <div className="font-medium">Quick Reference:</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                <div>**bold** → <strong>bold</strong></div>
                <div>*italic* → <em>italic</em></div>
                <div>x^2 or x² → x²</div>
                <div>H_2 or H₂ → H₂</div>
                <div>Use symbols from toolbar</div>
                <div>Chemical: H_2SO_4 → H₂SO₄</div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="min-h-[200px]">
            <CardContent className="p-4">
              {value.trim() ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
                />
              ) : (
                <div className="text-muted-foreground italic">
                  Nothing to preview yet. Start typing in the edit tab.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimpleMathEditor;