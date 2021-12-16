import { BaseEditor, Descendant, Editor, Node } from 'slate';
import { ReactEditor } from 'slate-react';
import { SlateBlockType, TextFormat } from './slate.interface';
import { isHotkey } from 'is-hotkey';

export const serializeToString = (nodes: Node[]) => {
  return nodes.map((n) => Node.string(n)).join('\n');
};

export type CustomElement =
  | { type: SlateBlockType; children: CustomText[] }
  | {
      type: SlateBlockType.MENTION_PAGE;
      pageId: string;
      children: CustomText[];
    };

type CustomText = {
  text: string;
  [TextFormat.BOLD]: boolean;
  [TextFormat.ITALIC]: boolean;
  [TextFormat.UNDERLINE]: boolean;
  [TextFormat.CODE]: boolean;
  [TextFormat.STRIKE_THROUGH]: boolean;
};

export type SlateValue = Descendant[];

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

export const HOTKEYS = {
  'mod+b': TextFormat.BOLD,
  'mod+i': TextFormat.ITALIC,
  'mod+u': TextFormat.UNDERLINE,
  'mod+e': TextFormat.CODE,
  'mod+shift+s': TextFormat.STRIKE_THROUGH,
};

export type Hotkey = keyof typeof HOTKEYS;

export const forEventToggleMarks = (
  editor: Editor,
  event: React.KeyboardEvent<HTMLDivElement>
) => {
  for (const hotkey in HOTKEYS) {
    if (isHotkey(hotkey, event)) {
      event.preventDefault();

      const mark = HOTKEYS[hotkey as Hotkey];
      toggleMark(editor, mark);
    }
  }
};

export const toggleMark = (editor: Editor, format: TextFormat) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isMarkActive = (editor: Editor, format: TextFormat) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const emptySlateText = {
  bold: false,
  italic: false,
  underline: false,
  code: false,
  strikeThrough: false,
};

export const slateStateFactory = (text: string): SlateValue => {
  return [
    {
      type: SlateBlockType.PARAGRAPH,
      children: [
        {
          text,
          ...emptySlateText,
        },
      ],
    },
  ];
};