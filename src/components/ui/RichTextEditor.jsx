import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

const Toolbar = ({ editor }) => {
    if (!editor) return null

    const setLink = () => {
        const url = window.prompt('URL')
        if (url) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }
    }

    return (
        <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border-b border-slate-100 rounded-t-[8px]">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`w-9 h-9 flex items-center justify-center rounded hover:bg-slate-200 transition-colors ${editor.isActive('bold') ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-slate-600'}`}
                title="Bold"
            >
                <i className="fas fa-bold text-sm"></i>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`w-9 h-9 flex items-center justify-center rounded hover:bg-slate-200 transition-colors ${editor.isActive('italic') ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-slate-600'}`}
                title="Italic"
            >
                <i className="fas fa-italic text-sm"></i>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`w-9 h-9 flex items-center justify-center rounded hover:bg-slate-200 transition-colors ${editor.isActive('bulletList') ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-slate-600'}`}
                title="Bullet List"
            >
                <i className="fas fa-list-ul text-sm"></i>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`w-9 h-9 flex items-center justify-center rounded hover:bg-slate-200 transition-colors ${editor.isActive('orderedList') ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-slate-600'}`}
                title="Numbered List"
            >
                <i className="fas fa-list-ol text-sm"></i>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
            <button
                type="button"
                onClick={setLink}
                className={`w-9 h-9 flex items-center justify-center rounded hover:bg-slate-200 transition-colors ${editor.isActive('link') ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-slate-600'}`}
                title="Link"
            >
                <i className="fas fa-link text-sm"></i>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().unsetLink().run()}
                disabled={!editor.isActive('link')}
                className="w-9 h-9 flex items-center justify-center rounded hover:bg-slate-200 transition-colors text-slate-600 disabled:opacity-30"
                title="Unlink"
            >
                <i className="fas fa-unlink text-sm"></i>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                className="w-9 h-9 flex items-center justify-center rounded hover:bg-slate-200 transition-colors text-slate-600"
                title="Undo"
            >
                <i className="fas fa-undo text-sm"></i>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                className="w-9 h-9 flex items-center justify-center rounded hover:bg-slate-200 transition-colors text-slate-600"
                title="Redo"
            >
                <i className="fas fa-redo text-sm"></i>
            </button>
        </div>
    )
}

const RichTextEditor = ({ value, onChange, label }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-indigo-600 underline cursor-pointer font-bold',
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm focus:outline-none min-h-[300px] p-6 text-slate-700 font-medium leading-relaxed max-w-none',
            },
        },
    })

    // Update content if value changes from outside (e.g. AI generation)
    // We use a ref to track the last value we sent to the editor to avoid loops
    const lastValueRef = React.useRef(value)

    React.useEffect(() => {
        if (editor && value !== editor.getHTML() && value !== lastValueRef.current) {
            editor.commands.setContent(value)
            lastValueRef.current = value
        }
    }, [value, editor])

    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                    {label}
                </label>
            )}
            <div className="border border-slate-100 rounded-[8px] focus-within:ring-2 focus-within:ring-indigo-500 transition-all overflow-hidden bg-white shadow-sm">
                <Toolbar editor={editor} />
                <EditorContent editor={editor} />
            </div>
            <style jsx global>{`
                .ProseMirror p {
                    margin-bottom: 1em;
                }
                .ProseMirror ul {
                    list-style-type: disc;
                    padding-left: 1.5em;
                    margin-bottom: 1em;
                }
                .ProseMirror ol {
                    list-style-type: decimal;
                    padding-left: 1.5em;
                    margin-bottom: 1em;
                }
            `}</style>
        </div>
    )
}

export default RichTextEditor
