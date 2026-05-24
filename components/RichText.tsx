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
      <a key={i} href={node.url} style={{ color: "#A87533", textDecoration: "underline" }}>
        {node.children?.map((c, j) => renderInline(c as InlineNode, j))}
      </a>
    );
  }
  const t = node as TextNode;
  let content: React.ReactNode = t.text ?? "";
  if (t.code) content = <code key={i} style={{ fontFamily: "monospace", background: "#F5F3EF", padding: "1px 4px", fontSize: "0.9em" }}>{content}</code>;
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
        <li key={j} style={{ marginBottom: "4px" }}>
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

  return <List key={i} style={{ paddingLeft: "1.5em", margin: "8px 0" }}>{items}</List>;
}

function renderBlock(block: Block, i: number): React.ReactNode {
  switch (block.type) {
    case "paragraph":
      return (
        <p key={i} style={{ marginBottom: "12px", lineHeight: 1.75, color: "#6F6A63", fontSize: "15px" }}>
          {block.children?.map((c, j) => renderInline(c as InlineNode, j))}
        </p>
      );
    case "heading": {
      const level = block.level ?? 2;
      const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return (
        <Tag key={i} style={{ marginBottom: "12px", marginTop: i === 0 ? 0 : "28px" }}>
          {block.children?.map((c, j) => renderInline(c as InlineNode, j))}
        </Tag>
      );
    }
    case "list":
      return renderList(block, i);
    case "quote":
      return (
        <blockquote key={i} style={{ borderLeft: "3px solid var(--color-accent)", paddingLeft: "16px", margin: "16px 0", color: "#6F6A63", fontStyle: "italic" }}>
          {block.children?.map((c, j) => renderInline(c as InlineNode, j))}
        </blockquote>
      );
    case "code":
      return (
        <pre key={i} style={{ background: "#F5F3EF", padding: "16px", overflowX: "auto", marginBottom: "12px" }}>
          <code style={{ fontFamily: "monospace", fontSize: "13px" }}>
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
