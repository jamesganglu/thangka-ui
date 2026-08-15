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
    <aside className="spy-sidebar">
      <nav className="spy-nav">
        {sections.map((s) =>
          s.children ? (
            <div key={s.label}>
              <div className="spy-group-label">
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
                    className={`spy-link spy-link--nested${isActive ? " spy-link--active" : ""}`}
                  >
                    <span className={`spy-link-dot${isActive ? " spy-link-dot--active" : ""}`} />
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
              className={`spy-link spy-link--top${activeId === s.id ? " spy-link--active" : ""}`}
            >
              <span className={`spy-link-dot${activeId === s.id ? " spy-link-dot--active" : ""}`} />
              {s.label}
            </a>
          )
        )}
      </nav>
    </aside>
  );
}
