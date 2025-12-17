'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEInstance } from 'tinymce';
import MediaPicker from './MediaPicker';

export interface TinyMCEEditorProps {
  value?: string;
  onChange?: (data: string) => void;
  placeholder?: string;
  id?: string;
}

const TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY?.trim();
const LOCAL_TINYMCE_SCRIPT = '/tinymce/tinymce.min.js';
const TINYMCE_SCRIPT_SRC =
  process.env.NEXT_PUBLIC_TINYMCE_SCRIPT_SRC?.trim() ||
  (TINYMCE_API_KEY ? `https://cdn.tiny.cloud/1/${TINYMCE_API_KEY}/tinymce/7/tinymce.min.js` : LOCAL_TINYMCE_SCRIPT);

const WORD_LIKE_MENUBAR = 'file edit view insert format tools table help';

const WORD_LIKE_PLUGINS = [
  'advlist',
  'anchor',
  'autolink',
  'autosave',
  'charmap',
  'code',
  'codesample',
  'directionality',
  'emoticons',
  'fullscreen',
  'help',
  'image',
  'importcss',
  'insertdatetime',
  'link',
  'lists',
  'media',
  'nonbreaking',
  'pagebreak',
  'preview',
  'quickbars',
  'save',
  'searchreplace',
  'table',
  'visualblocks',
  'visualchars',
  'wordcount',
];

const WORD_LIKE_TOOLBAR = [
  // Hàng 1: Định dạng (formatting) - thêm clearFont button
  'blocks formatselect fontfamily clearFont fontsize bold italic underline strikethrough forecolor backcolor superscript subscript removeformat',
  // Hàng 2: Căn chỉnh và danh sách - gom thành group
  'alignleft aligncenter alignright alignjustify outdent indent bullist numlist',
  // Hàng 3: Chèn nội dung - gom thành group
  'link image media customMediaLibrary table tabledelete blockquote hr pagebreak insertdatetime',
  // Hàng 4: Các công cụ khác - gom thành group
  'charmap emoticons searchreplace ltr rtl visualblocks',
  // Hàng 5 (cuối): Undo, redo, save, preview, fullscreen, source code - gom thành group
  'undo redo save preview fullscreen code',
].join('\n');

export default function TinyMCEEditor({
  value = '',
  onChange,
  placeholder = 'Start writing your post content here...',
  id,
}: TinyMCEEditorProps) {
  const editorRef = useRef<TinyMCEInstance | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const editorIdRef = useRef(id || `tinymce-editor-${Math.random().toString(36).substring(2, 9)}`);
  const editorId = editorIdRef.current;

  const handleEditorChange = useCallback(
    (next: string) => {
      onChange?.(next);
    },
    [onChange],
  );

  const handleInsertFromMediaLibrary = useCallback(
    (imageUrl: string) => {
      if (editorRef.current) {
        editorRef.current.insertContent(
          `<figure class="image"><img src="${imageUrl}" alt="" /></figure>`,
        );
      }
      setMediaPickerOpen(false);
    },
    [],
  );

  useEffect(() => {
    // Delay initialization slightly to avoid conflicts with multiple editors
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (editorRef.current) {
        editorRef.current.remove();
        editorRef.current = null;
      }
    };
  }, []);

  if (!isReady) {
    return (
      <div className="w-full min-h-[300px] rounded-lg border border-input bg-background p-4 flex items-center justify-center text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        id={editorId} 
        style={{ 
          width: '100%', 
          minWidth: 0,
          overflow: 'visible',
          position: 'relative'
        }} 
      />
      <style jsx global>{`
        #${editorId} .tox-tinymce {
          width: 100% !important;
          min-width: 0 !important;
          overflow: visible !important;
        }
        #${editorId} .tox-editor-header {
          width: 100% !important;
          min-width: 0 !important;
          overflow-x: auto !important;
          overflow-y: visible !important;
        }
        #${editorId} .tox-toolbar {
          width: 100% !important;
          min-width: 0 !important;
          flex-wrap: wrap !important;
        }
      `}</style>
      <Editor
        id={editorId}
        key={editorId}
        apiKey={TINYMCE_API_KEY || undefined}
        tinymceScriptSrc={TINYMCE_SCRIPT_SRC}
        onInit={(_, editor) => {
          editorRef.current = editor;
          console.log(`[TinyMCE] Editor initialized: ${editorId}`, editor);
          // Force toolbar to render and fix width
          setTimeout(() => {
            if (editor && editor.ui) {
              const container = document.getElementById(editorId);
              if (container) {
                const editorElement = container.querySelector('.tox-tinymce') as HTMLElement;
                if (editorElement) {
                  editorElement.style.width = '100%';
                  editorElement.style.minWidth = '0';
                  editorElement.style.overflow = 'visible';
                }
                const toolbar = container.querySelector('.tox-toolbar') as HTMLElement;
                if (toolbar) {
                  toolbar.style.width = '100%';
                  toolbar.style.minWidth = '0';
                  toolbar.style.flexWrap = 'wrap';
                }
              }
            }
          }, 300);
        }}
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          selector: `#${editorId}`,
          target: document.getElementById(editorId) || undefined,
          placeholder,
          height: 600,
          license_key: 'gpl',
          menubar: WORD_LIKE_MENUBAR,
          toolbar: WORD_LIKE_TOOLBAR,
          plugins: WORD_LIKE_PLUGINS,
          toolbar_mode: 'wrap',
          toolbar_sticky: false,
          toolbar_sticky_offset: 0,
          autosave_interval: '30s',
          autosave_restore_when_empty: true,
          autosave_ask_before_unload: true,
          branding: false,
          browser_spellcheck: false, // Tắt spell checking để không hiển thị gạch chân đỏ cho tiếng Việt
          promotion: false,
          contextmenu: 'undo redo | copy paste | link image table',
          // Cấu hình entity encoding để không encode ký tự tiếng Việt
          entity_encoding: 'raw', // Không encode thành HTML entities (giữ nguyên ký tự)
          entities: '160,nbsp,38,amp,60,lt,62,gt,8220,ldquo,8221,rdquo,8211,ndash,8212,mdash,8216,lsquo,8217,rsquo', // Chỉ encode các entities cần thiết
          // Decode entities khi paste
          paste_preprocess: (plugin, args) => {
            // Decode HTML entities thành ký tự thường
            const decodeEntities = (text: string) => {
              const textarea = document.createElement('textarea');
              textarea.innerHTML = text;
              return textarea.value;
            };
            args.content = decodeEntities(args.content);
          },
          content_style: `
            /* Load đầy đủ các font từ Google Fonts với đầy đủ weights */
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Nunito+Sans:wght@400;600;700&family=Be+Vietnam+Pro:wght@400;500;600;700&family=Source+Sans+Pro:wght@400;600;700&family=Raleway:wght@400;500;600;700&family=Lato:wght@400;700&family=Ubuntu:wght@400;500;700&family=Lora:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;500;600;700&family=Dancing+Script:wght@400;500;600;700&family=Pacifico&display=swap&subset=latin,vietnamese');
            
            body {
              font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
              font-size: 16px;
              line-height: 1.7;
              color: #0f172a;
              /* Font rendering optimization - làm cho text mượt mà hơn */
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
              font-feature-settings: "kern" 1;
              font-kerning: normal;
            }
            /* Inline font-family styles tự động có priority cao nhất */
            /* Không cần override vì inline styles luôn được tôn trọng */
            /* Đảm bảo các font được load đầy đủ với các weight */
            /* Inline font-family styles sẽ tự động được áp dụng */
            /* Không cần override vì inline styles có priority cao hơn CSS */
            /* Headings có font-weight: 700 (bold) và font-size lớn hơn - đây là lý do trông khác nhau */
            /* Font-size match với Tailwind config để đồng bộ với frontend */
            h1 {
              font-size: 2.25rem; /* 36px - match với text-h1 */
              font-weight: 700;
              margin-top: 1.5em;
              margin-bottom: 0.75em;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
              letter-spacing: -0.01em;
              line-height: 1.2;
            }
            h2 {
              font-size: 1.875rem; /* 30px - match với text-h2 */
              font-weight: 700;
              margin-top: 1.5em;
              margin-bottom: 0.75em;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
              letter-spacing: -0.01em;
              line-height: 1.3;
            }
            h3 {
              font-size: 1.5rem; /* 24px - match với text-h3 */
              font-weight: 700;
              margin-top: 1.5em;
              margin-bottom: 0.75em;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
              letter-spacing: -0.01em;
              line-height: 1.3;
            }
            h4 {
              font-size: 1.25rem; /* 20px - match với text-h4 */
              font-weight: 700;
              margin-top: 1.5em;
              margin-bottom: 0.75em;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
              letter-spacing: -0.01em;
              line-height: 1.3;
            }
            h5, h6 {
              font-size: 1.125rem; /* 18px */
              font-weight: 700;
              margin-top: 1.5em;
              margin-bottom: 0.75em;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
              letter-spacing: -0.01em;
              line-height: 1.3;
            }
            /* Strong/bold text cũng phải có font-weight: 700 để match với frontend */
            strong, b {
              font-weight: 700;
              /* Font rendering optimization */
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }
            /* Đảm bảo headings với inline font-family có các properties giống nhau */
            h1[style*="font-family"] {
              font-size: 2.25rem !important;
              font-weight: 700 !important;
              letter-spacing: -0.01em !important;
              line-height: 1.2 !important;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }
            h2[style*="font-family"] {
              font-size: 1.875rem !important;
              font-weight: 700 !important;
              letter-spacing: -0.01em !important;
              line-height: 1.3 !important;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }
            h3[style*="font-family"] {
              font-size: 1.5rem !important;
              font-weight: 700 !important;
              letter-spacing: -0.01em !important;
              line-height: 1.3 !important;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }
            h4[style*="font-family"] {
              font-size: 1.25rem !important;
              font-weight: 700 !important;
              letter-spacing: -0.01em !important;
              line-height: 1.3 !important;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }
            h5[style*="font-family"],
            h6[style*="font-family"] {
              font-size: 1.125rem !important;
              font-weight: 700 !important;
              letter-spacing: -0.01em !important;
              line-height: 1.3 !important;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }
            /* Strong/bold với inline font-family */
            strong[style*="font-family"],
            b[style*="font-family"] {
              font-weight: 700 !important;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }
            /* Font rendering optimization cho tất cả elements có inline font-family */
            *[style*="font-family"] {
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }
            /* Đặc biệt cho Open Sans và các font khác */
            *[style*="font-family: 'Open Sans'"],
            *[style*="font-family:Open Sans"],
            *[style*="font-family: 'Open Sans',"],
            *[style*="font-family:Open Sans,"],
            *[style*="font-family: Roboto"],
            *[style*="font-family:Roboto"],
            *[style*="font-family: Montserrat"],
            *[style*="font-family:Montserrat"],
            *[style*="font-family: Poppins"],
            *[style*="font-family:Poppins"] {
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
              font-feature-settings: "kern" 1;
              font-kerning: normal;
            }
            /* Paragraphs có font-weight: normal (400) và font-size: 16px */
            p {
              font-weight: 400;
              font-size: 16px;
              /* Font rendering optimization */
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }
            figure.image {
              display: inline-block;
              margin: 1.5em auto;
              text-align: center;
            }
            figure.image img {
              border-radius: 0.5rem;
              max-width: 100%;
              height: auto;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            table td, table th {
              border: 1px solid #cbd5f5;
              padding: 8px;
            }
            blockquote {
              border-left: 4px solid #1d4ed8;
              padding-left: 1rem;
              margin-left: 0;
              color: #475569;
              font-style: italic;
            }
            code {
              background: #f1f5f9;
              padding: 0.2rem 0.4rem;
              border-radius: 0.25rem;
              font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
              font-size: 0.9em;
            }
            pre code {
              display: block;
              padding: 1rem;
              overflow-x: auto;
            }
            /* Horizontal rule - khoảng cách xa giữa các nội dung */
            hr {
              margin-top: 2em;
              margin-bottom: 2em;
              border: none;
              border-top: 1px solid #e5e7eb;
              height: 0;
            }
          `,
          font_family_formats:
            // Sans-serif (không chân) - tốt cho tiếng Việt
            // Roboto được đặt đầu tiên vì là font phổ biến cho tiếng Việt
            'Roboto=Roboto,sans-serif;' +
            'Inter=Inter,sans-serif;' +
            'Open Sans=Open Sans,sans-serif;' +
            'Montserrat=Montserrat,sans-serif;' +
            'Poppins=Poppins,sans-serif;' +
            'Nunito Sans=Nunito Sans,sans-serif;' +
            'Be Vietnam Pro=Be Vietnam Pro,sans-serif;' +
            'Arial=Arial,Helvetica,sans-serif;' +
            'Helvetica=Helvetica,Arial,sans-serif;' +
            'Verdana=Verdana,Geneva,sans-serif;' +
            'Tahoma=Tahoma,Geneva,sans-serif;' +
            'Trebuchet MS=Trebuchet MS,Helvetica,sans-serif;' +
            'Source Sans Pro=Source Sans Pro,sans-serif;' +
            'Raleway=Raleway,sans-serif;' +
            'Lato=Lato,sans-serif;' +
            'Ubuntu=Ubuntu,sans-serif;' +
            // Serif (có chân)
            'Lora=Lora,serif;' +
            'Georgia=Georgia,serif;' +
            'Times New Roman=Times New Roman,Times,serif;' +
            'Palatino=Palatino,Palatino Linotype,serif;' +
            'Garamond=Garamond,serif;' +
            'Merriweather=Merriweather,serif;' +
            'Playfair Display=Playfair Display,serif;' +
            // Monospace (đơn cách)
            'Courier New=Courier New,Courier,monospace;' +
            'Consolas=Consolas,monaco,monospace;' +
            'JetBrains Mono=JetBrains Mono,monospace;' +
            // Display/Decorative
            'Dancing Script=Dancing Script,cursive;' +
            'Pacifico=Pacifico,cursive',
          fontsize_formats: '8pt 10pt 12pt 14pt 16pt 18pt 20pt 24pt 28pt 32pt 36pt 48pt',
          line_height_formats: '1 1.2 1.4 1.5 1.7 2',
          block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre',
          image_advtab: true,
          image_caption: true,
          image_title: true,
          convert_urls: false,
          quickbars_insert_toolbar: false,
          quickbars_selection_toolbar: false,
          save_enablewhendirty: true,
          save_onsavecallback: () => {
            if (editorRef.current) {
              onChange?.(editorRef.current.getContent());
            }
          },
          setup: (editor) => {
            editor.ui.registry.addButton('customMediaLibrary', {
              icon: 'gallery',
              tooltip: 'Insert from Media Library',
              onAction: () => {
                editorRef.current = editor;
                setMediaPickerOpen(true);
              },
            });

            // Helper function to decode HTML entities
            const decodeEntities = (html: string): string => {
              const textarea = document.createElement('textarea');
              textarea.innerHTML = html;
              return textarea.value;
            };

            // Clear Font button - xóa tất cả font-family và decode entities
            editor.ui.registry.addButton('clearFont', {
              text: 'Clear Font',
              tooltip: 'Xóa font và decode ký tự (dùng font mặc định của trang)',
              onAction: () => {
                let content = editor.getContent();
                
                // Decode HTML entities trước
                content = decodeEntities(content);
                
                // Remove all inline font-family styles
                let cleaned = content
                  .replace(/style\s*=\s*["']([^"']*)["']/gi, (match, styleContent) => {
                    // Remove font-family và fontFamily
                    const cleanedStyle = styleContent
                      .replace(/font-family\s*:\s*[^;]+;?/gi, '')
                      .replace(/fontFamily\s*:\s*[^;]+;?/gi, '')
                      .trim()
                      .replace(/;\s*;/g, ';')
                      .replace(/^;|;$/g, '');
                    
                    if (!cleanedStyle) {
                      return '';
                    }
                    return `style="${cleanedStyle}"`;
                  })
                  // Remove <span> tags chỉ có font-family
                  .replace(/<span\s+style\s*=\s*["']font-family\s*:\s*[^"']+["']\s*>/gi, '<span>')
                  // Remove empty style attributes
                  .replace(/\s+style\s*=\s*["']\s*["']/gi, '')
                  // Remove <font> tags (từ Word)
                  .replace(/<font[^>]*>/gi, '')
                  .replace(/<\/font>/gi, '');
                
                editor.setContent(cleaned);
                editor.fire('change');
                
                // Show notification
                editor.notificationManager.open({
                  text: 'Đã xóa font và decode ký tự. Nội dung sẽ dùng font mặc định của trang.',
                  type: 'success',
                  timeout: 3000,
                });
              },
            });
          },
        }}
      />

      <MediaPicker
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleInsertFromMediaLibrary}
        modalOnly
      />
    </>
  );
}


