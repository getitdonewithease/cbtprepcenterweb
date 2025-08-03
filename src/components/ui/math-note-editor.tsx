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
  Sigma,
  Type,
  Eye,
  Edit
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MathNoteEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

const MathNoteEditor: React.FC<MathNoteEditorProps> = ({
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

  const mathButtons = [
    {
      label: 'Power',
      icon: <Superscript className="h-4 w-4" />,
      action: () => insertText('$x^{', '}$', '2'),
      tooltip: 'Superscript: $x^{2}$'
    },
    {
      label: 'Subscript', 
      icon: <Subscript className="h-4 w-4" />,
      action: () => insertText('$x_{', '}$', '1'),
      tooltip: 'Subscript: $x_{1}$'
    },
    {
      label: 'Fraction',
      icon: <Calculator className="h-4 w-4" />,
      action: () => insertText('$\\frac{', '}{2}$', '1'),
      tooltip: 'Fraction: $\\frac{1}{2}$'
    },
    {
      label: 'Square Root',
      icon: <Sigma className="h-4 w-4" />,
      action: () => insertText('$\\sqrt{', '}$', 'x'),
      tooltip: 'Square root: $\\sqrt{x}$'
    },
    {
      label: 'Chemical',
      icon: <FlaskConical className="h-4 w-4" />,
      action: () => insertText('H$_{', '}$O', '2'),
      tooltip: 'Chemical formula: H₂O'
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
          {/* Math Toolbar */}
          <Card className="p-3">
            <div className="space-y-3">
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
            </div>
          </Card>

          {/* Text Area */}
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="resize-none font-mono text-sm"
          />

          {/* Quick Reference */}
          <Card className="p-3 bg-muted/30">
            <div className="text-xs space-y-1">
              <div className="font-medium">Quick Reference:</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                <div>**bold** → <strong>bold</strong></div>
                <div>*italic* → <em>italic</em></div>
                <div>{"$x^2$ → x²"}</div>
                <div>{"$H_2O$ → H₂O"}</div>
                <div>{"$\\frac{a}{b}$ → fraction"}</div>
                <div>{"$\\sqrt{x}$ → √x"}</div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="min-h-[200px]">
            <CardContent className="p-4">
              {value.trim() ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      // Customize rendering if needed
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    }}
                  >
                    {value}
                  </ReactMarkdown>
                </div>
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

export default MathNoteEditor;