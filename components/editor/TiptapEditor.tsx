'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading2,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';
import { useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  className = '',
}: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer hover:text-primary/80 transition-colors',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3 text-foreground dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className={`glass-card-light dark:glass-card rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar with better contrast */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[rgba(167,139,250,0.2)] p-2 bg-muted/90 dark:bg-muted/70 backdrop-blur-sm">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-primary/20 dark:bg-primary/30 text-primary-foreground dark:shadow-[0_0_12px_rgba(167,139,250,0.4)]' : 'hover:bg-primary/10'}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-primary/20 dark:bg-primary/30 text-primary-foreground dark:shadow-[0_0_12px_rgba(167,139,250,0.4)]' : 'hover:bg-primary/10'}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-primary/20 dark:bg-primary/30 text-primary-foreground dark:shadow-[0_0_12px_rgba(167,139,250,0.4)]' : 'hover:bg-primary/10'}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-primary/20 dark:bg-primary/30 text-primary-foreground dark:shadow-[0_0_12px_rgba(167,139,250,0.4)]' : 'hover:bg-primary/10'}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-primary/20 dark:bg-primary/30 text-primary-foreground dark:shadow-[0_0_12px_rgba(167,139,250,0.4)]' : 'hover:bg-primary/10'}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-primary/20 dark:bg-primary/30 text-primary-foreground dark:shadow-[0_0_12px_rgba(167,139,250,0.4)]' : 'hover:bg-primary/10'}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleLink}
          className={editor.isActive('link') ? 'bg-primary/20 dark:bg-primary/30 text-primary-foreground dark:shadow-[0_0_12px_rgba(167,139,250,0.4)]' : 'hover:bg-primary/10'}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="hover:bg-primary/10"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="hover:bg-primary/10"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content with better contrast */}
      <div className="bg-card/50 dark:bg-card/30">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
