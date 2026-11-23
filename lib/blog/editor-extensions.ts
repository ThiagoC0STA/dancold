import { wrappingInputRule } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { OrderedList } from "@tiptap/extension-list";
import StarterKit from "@tiptap/starter-kit";

/**
 * O que o editor do blog sabe fazer: só o que o site mostra. Usado pelo editor
 * e pelo scripts/check-markdown.mts, que confere a ida e a volta nos posts reais.
 */
export const editorExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    underline: false,
    orderedList: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      HTMLAttributes: { rel: "noopener noreferrer", target: null },
    },
  }),
  // lista numerada só nasce digitando "1. ": "2026. Foi um ano..." continua parágrafo
  OrderedList.extend({
    addInputRules() {
      return [wrappingInputRule({ find: /^1[.)]\s$/, type: this.type })];
    },
  }),
  Image.configure({ inline: false, allowBase64: false }).extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: { default: null },
        height: { default: null },
      };
    },
  }),
];
