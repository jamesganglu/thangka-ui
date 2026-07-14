"use client";

import { useEffect, useState } from "react";

interface Section {
  id?: string;
  label: string;
  children?: Section[];
}

function flattenLeaves(sections: Section[]): Section[] {
  return sections.flatMap((s) => (s.children ? flattenLeaves(s.children) : [s]));
}

export default function ScrollSpySidebar({
  sections,
}: {
  sections: Section[];
}) {
  const leaves = flattenLeaves(sections);
  const [activeId, setActiveId] = useState(leaves[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-10% 0px -80% 0px", threshold: 0 }
    );

    leaves.forEach((s) => {
      const el = document.getElementById(s.id!);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [leaves]);

  return (
    <aside
      style={{
        width: "220px",
        flexShrink: 0,
        position: "sticky",
        top: "120px",
        alignSelf: "flex-start",
        border: "1px solid var(--color-accent)",
      }}
    >
      <nav style={{ display: "flex", flexDirection: "column", gap: "0", padding: "1em" }}>
        {sections.map((s) =>
          s.children ? (
            <div key={s.label}>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "#2B2520",
                  paddingLeft: "12px",
                  paddingTop: "12px",
                  paddingBottom: "4px",
                }}
              >
                {s.label}
              </div>
              {s.children.map((child) => {
                const isActive = activeId === child.id;
                return (
                  <a
                    key={child.id}
                    href={`#${child.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById(child.id!)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "13px",
                      lineHeight: 1.4,
                      color: isActive ? "#A87533" : "#6F6A63",
                      paddingLeft: "24px",
                      paddingTop: "8px",
                      paddingBottom: "8px",
                      transition: "color 0.2s",
                      textDecoration: "none",
                    }}
                  >
                    <span style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: isActive ? "#A87533" : "transparent",
                      flexShrink: 0,
                    }} />
                    {child.label}
                  </a>
                );
              })}
            </div>
          ) : (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(s.id!)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "13px",
                lineHeight: 1.4,
                color: activeId === s.id ? "#A87533" : "#6F6A63",
                paddingLeft: "12px",
                paddingTop: "8px",
                paddingBottom: "8px",
                transition: "color 0.2s",
                textDecoration: "none",
              }}
            >
              <span style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: activeId === s.id ? "#A87533" : "transparent",
                flexShrink: 0,
              }} />
              {s.label}
            </a>
          )
        )}
      </nav>
    </aside>
  );
}
