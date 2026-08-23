import React from "react";

type TextNode = {
  type: "text";
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
};

type LinkNode = {
  type: "link";
  url?: string;
  children?: InlineNode[];
};

type InlineNode = TextNode | LinkNode;

type Block = {
  type: string;
  level?: number;
  format?: "ordered" | "unordered";
  children?: (InlineNode | Block)[];
};

function renderInline(node: InlineNode, i: number): React.ReactNode {
  if (node.type === "link") {
    return (
      <a key={i} href={node.url}>
        {node.children?.map((c, j) => renderInline(c as InlineNode, j))}
      </a>
    );
  }
  const t = node as TextNode;
  let content: React.ReactNode = t.text ?? "";
  if (t.code) content = <code key={i}>{content}</code>;
  else {
    if (t.bold) content = <strong key={i}>{content}</strong>;
    if (t.italic) content = <em key={i}>{content}</em>;
    if (t.underline) content = <u key={i}>{content}</u>;
    if (t.strikethrough) content = <s key={i}>{content}</s>;
  }
  return content;
}

function renderList(block: Block, i: number): React.ReactNode {
  const List = block.format === "ordered" ? "ol" : "ul";
  const children = (block.children ?? []) as Block[];
  const items: React.ReactNode[] = [];

  let j = 0;
  while (j < children.length) {
    const child = children[j];
    if (child.type === "list-item") {
      // Strapi places sub-lists as the next sibling, not inside the list-item
      const next = children[j + 1] as Block | undefined;
      const hasSubList = next?.type === "list";
      items.push(
        <li key={j}>
          {child.children?.map((c, k) => renderInline(c as InlineNode, k))}
          {hasSubList && renderList(next!, j + 1)}
        </li>
      );
      j += hasSubList ? 2 : 1;
    } else if (child.type === "list") {
      // Orphaned sub-list — render as-is
      items.push(renderList(child, j));
      j += 1;
    } else {
      j += 1;
    }
  }

  return <List key={i}>{items}</List>;
}

function renderBlock(block: Block, i: number): React.ReactNode {
  switch (block.type) {
    case "paragraph":
      return (
        <p key={i}>
          {block.children?.map((c, j) => renderInline(c as InlineNode, j))}
        </p>
      );
    case "heading": {
      // Clamp to h2-h6: RichText only ever renders body content — the
      // page's own <h1> is set separately — so an editor picking
      // "Heading 1" in the CMS shouldn't be able to inject a second <h1>.
      const level = Math.min(6, Math.max(2, block.level ?? 2));
      const Tag = `h${level}` as "h2" | "h3" | "h4" | "h5" | "h6";
      return (
        <Tag key={i}>
          {block.children?.map((c, j) => renderInline(c as InlineNode, j))}
        </Tag>
      );
    }
    case "list":
      return renderList(block, i);
    case "quote":
      return (
        <blockquote key={i}>
          {block.children?.map((c, j) => renderInline(c as InlineNode, j))}
        </blockquote>
      );
    case "code":
      return (
        <pre key={i}>
          <code>
            {block.children?.map((c, j) => renderInline(c as InlineNode, j))}
          </code>
        </pre>
      );
    default:
      return null;
  }
}

export default function RichText({ content }: { content: unknown }) {
  if (!content) return null;

  return (
    <div className="rich-text">
      {typeof content === "string" ? (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      ) : Array.isArray(content) ? (
        content.map((block, i) => renderBlock(block as Block, i))
      ) : null}
    </div>
  );
}
