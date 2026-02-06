'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check } from 'lucide-react';

interface UsageExamplesProps {
  prefix: string;
  fontFamily: string;
  iconNames: string[];
}

function CopyBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/50">
        <span className="text-xs font-medium">{label}</span>
        <Button variant="ghost" size="sm" className="h-6 px-2" onClick={handleCopy}>
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <pre className="p-3 text-xs font-mono whitespace-pre-wrap">{code}</pre>
    </div>
  );
}

export function UsageExamples({ prefix, fontFamily, iconNames }: UsageExamplesProps) {
  const sampleName = iconNames[0] || 'icon-name';

  const htmlUsage = `<!-- Include the CSS file -->
<link rel="stylesheet" href="${fontFamily}.css">

<!-- Use icons with the class name -->
<i class="${prefix}-${sampleName}"></i>`;

  const cssUsage = `/* Import the font */
@import url('${fontFamily}.css');

/* Use in your CSS with content property */
.custom-icon::before {
  font-family: '${fontFamily}';
  content: "\\e000";
}`;

  const reactUsage = `// Import the CSS in your app
import './${fontFamily}.css';

// Use the icon component
function Icon({ name }: { name: string }) {
  return <i className={\`${prefix}-\${name}\`} />;
}

// Usage
<Icon name="${sampleName}" />`;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <h3 className="font-medium text-sm">Usage Examples</h3>
        <CopyBlock label="HTML" code={htmlUsage} />
        <CopyBlock label="CSS" code={cssUsage} />
        <CopyBlock label="React" code={reactUsage} />
      </div>
    </ScrollArea>
  );
}
