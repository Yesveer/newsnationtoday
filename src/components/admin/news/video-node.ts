import { Node, mergeAttributes } from "@tiptap/core";

/** A video inside the story body.
 *
 *  Tiptap's image extension only knows `<img>`, so a clip dropped into a
 *  paragraph used to vanish from the editor the moment it was inserted —
 *  nothing to see, nothing to select, nothing to delete. This is the smallest
 *  node that fixes that: an atom, so it behaves as one object the writer can
 *  click and remove, holding the same attributes the public page renders.
 *
 *  It is not a reel. The reel is cut from the cover video; a clip here
 *  illustrates a paragraph and travels with the text. */
export interface VideoAttributes {
  src: string;
  poster?: string | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    storyVideo: {
      setStoryVideo: (attributes: VideoAttributes) => ReturnType;
    };
  }
}

export const StoryVideo = Node.create({
  name: "storyVideo",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      poster: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "video[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(HTMLAttributes, {
        controls: "true",
        preload: "metadata",
        class: "w-full rounded-lg bg-black",
      }),
    ];
  },

  addCommands() {
    return {
      setStoryVideo:
        (attributes) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: attributes }),
    };
  },
});
