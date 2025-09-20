// src/pages/cms/Knowledge.tsx
import React, { ChangeEvent, useMemo, useState } from "react";

interface ArticleLite {
  id: string;
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  updatedAt: string;
  author: string;
  status: "Draft" | "Published" | "Archived";
}

const Section = ({
  title,
  children,
}: React.PropsWithChildren<{ title: string }>) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5">
    <div className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">
      {title}
    </div>
    {children}
  </div>
);

const SEED: ArticleLite[] = [
  {
    id: "ART-001",
    title: "How to create a Custom Rate",
    slug: "create-custom-rate",
    summary: "Submit and route a custom rate request.",
    tags: ["Rates", "Sales"],
    updatedAt: "2025-09-15T09:00:00Z",
    author: "Ops Team",
    status: "Published",
  },
  {
    id: "ART-002",
    title: "Booking Checklist (FCL)",
    slug: "booking-checklist-fcl",
    summary: "Documents & steps to confirm an FCL booking.",
    tags: ["Bookings", "FCL"],
    updatedAt: "2025-09-20T12:00:00Z",
    author: "Pricing",
    status: "Draft",
  },
];

export default function Knowledge() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const published = SEED.filter((a) => a.status === "Published");

  const tags = useMemo(() => {
    const t = new Set<string>();
    published.forEach((a) => a.tags.forEach((x) => t.add(x)));
    return Array.from(t).sort();
  }, []);

  const filtered = useMemo(() => {
    let list = published;
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(s) ||
          a.summary.toLowerCase().includes(s)
      );
    }
    if (tag) list = list.filter((a) => a.tags.includes(tag));
    return list;
  }, [q, tag]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">
          CMS Management ▸ View Articles & Guides
        </div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Articles & Guides
        </div>
        <div className="mt-1 text-sm opacity-95">
          Browse how-tos, policies, and best practices.
        </div>
      </div>

      <Section title="Find content">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 dark:text-white">
              Search
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-white dark:bg-white"
              placeholder="Search title or summary…"
              value={q}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setQ(e.target.value)
              }
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-white">Tag</label>
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-white dark:bg-white"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            >
              <option value="">All</option>
              {tags.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section title={`Articles (${filtered.length})`}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((a) => (
            <article
              key={a.id}
              className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {a.title}
              </h3>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                {a.summary}
              </p>
              <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-gray-500">
                {a.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-gray-300/70 px-2 py-0.5 dark:border-gray-700/70"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-[11px] text-gray-500">
                Updated: {new Date(a.updatedAt).toLocaleDateString()} •{" "}
                {a.author}
              </div>
              <div className="mt-3">
                <button className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700">
                  Read
                </button>
              </div>
            </article>
          ))}
          {!filtered.length && (
            <div className="col-span-full rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              Nothing found.
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
