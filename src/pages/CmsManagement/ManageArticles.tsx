// src/pages/cms/ManageArticles.tsx
import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  ChangeEvent,
} from "react";
import { createPortal } from "react-dom";
import Badge from "../../components/ui/badge/Badge";

type Status = "Draft" | "Published" | "Archived";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  status: Status;
}

const statusColor = (s: Status) =>
  s === "Published" ? "success" : s === "Archived" ? "error" : "warning";

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

const SEED: Article[] = [
  {
    id: "ART-001",
    title: "How to create a Custom Rate",
    slug: "create-custom-rate",
    summary: "Step-by-step guide to submit and route a custom rate request.",
    tags: ["Rates", "Sales"],
    content:
      "## Creating a Custom Rate\n\n1. Go to Rates → Custom Rate Requests …",
    author: "Ops Team",
    createdAt: "2025-09-15T09:00:00Z",
    updatedAt: "2025-09-15T09:00:00Z",
    status: "Published",
  },
  {
    id: "ART-002",
    title: "Booking Checklist (FCL)",
    slug: "booking-checklist-fcl",
    summary: "Documents & steps to confirm an FCL booking on time.",
    tags: ["Bookings", "FCL"],
    content: "### Checklist\n- SO copy\n- VGM\n- SI cut-off …",
    author: "Pricing",
    createdAt: "2025-09-20T12:00:00Z",
    updatedAt: "2025-09-20T12:00:00Z",
    status: "Draft",
  },
];

export default function ManageArticles() {
  const [rows, setRows] = useState<Article[]>(SEED);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | Status>("");
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useMemo(
    () => rows.find((r) => r.id === openId) || null,
    [rows, openId]
  );

  const filtered = useMemo(() => {
    let list = rows;
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(s) ||
          r.slug.toLowerCase().includes(s) ||
          r.tags.some((t) => t.toLowerCase().includes(s))
      );
    }
    if (status) list = list.filter((r) => r.status === status);
    return list;
  }, [rows, q, status]);

  // actions
  const publish = (id: string) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "Published", updatedAt: new Date().toISOString() }
          : r
      )
    );
  const archive = (id: string) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "Archived", updatedAt: new Date().toISOString() }
          : r
      )
    );
  const duplicate = (id: string) =>
    setRows((prev) => {
      const src = prev.find((r) => r.id === id)!;
      const copy: Article = {
        ...src,
        id: `ART-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        title: src.title + " (Copy)",
        slug: src.slug + "-copy",
        status: "Draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return [copy, ...prev];
    });

  // drawer state (create/edit)
  const [form, setForm] = useState<
    Omit<Article, "id" | "createdAt" | "updatedAt">
  >({
    title: "",
    slug: "",
    summary: "",
    tags: [],
    content: "",
    author: "You",
    status: "Draft",
  });

  const newArticle = () => {
    const a: Article = {
      id: `ART-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...form,
    };
    setRows((prev) => [a, ...prev]);
    setOpenId(a.id);
  };

  const saveEdit = (id: string) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, ...form, updatedAt: new Date().toISOString() } : r
      )
    );

  const loadToForm = (a: Article | null) => {
    if (!a) return;
    setForm({
      title: a.title,
      slug: a.slug,
      summary: a.summary,
      tags: a.tags,
      content: a.content,
      author: a.author,
      status: a.status,
    });
  };

  // drawer a11y/helpers
  const panelRef = useRef<HTMLDivElement | null>(null);
  const close = () => setOpenId(null);
  useEffect(() => {
    if (!open) return;
    loadToForm(open);
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [open]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">
          CMS Management ▸ Manage Articles
        </div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Manage Articles
        </div>
        <div className="mt-1 text-sm opacity-95">
          Create, edit, publish, and organize your knowledge base.
        </div>
      </div>

      {/* Filters + New */}
      <Section title="Filters">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Search
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-white dark:bg-white"
              placeholder="Title, slug, or tag…"
              value={q}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setQ(e.target.value)
              }
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Status
            </label>
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-white "
              value={status}
              onChange={(e) => setStatus(e.target.value as Status | "")}
            >
              <option value="">All</option>
              {["Draft", "Published", "Archived"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="ml-auto flex gap-2">
              <button
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                onClick={() => {
                  setQ("");
                  setStatus("");
                }}
              >
                Reset
              </button>
              <button
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                onClick={() => {
                  setForm({
                    title: "",
                    slug: "",
                    summary: "",
                    tags: [],
                    content: "",
                    author: "You",
                    status: "Draft",
                  });
                  newArticle();
                }}
              >
                New Article
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* List */}
      <Section title={`Articles (${filtered.length})`}>
        <div className="space-y-3">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {a.title}
                    </div>
                    <Badge size="sm" color={statusColor(a.status) as any}>
                      {a.status}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                    /{a.slug} • Tags: {a.tags.join(", ") || "—"} • Author:{" "}
                    <b>{a.author}</b>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {a.summary}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <button
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    onClick={() => setOpenId(a.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    disabled={a.status === "Published"}
                    onClick={() => publish(a.id)}
                  >
                    Publish
                  </button>
                  <button
                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
                    onClick={() => duplicate(a.id)}
                  >
                    Duplicate
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                    disabled={a.status === "Archived"}
                    onClick={() => archive(a.id)}
                  >
                    Archive
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Drawer (editor) */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[200000]">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
              onClick={() => setOpenId(null)}
            />
            <div
              ref={panelRef}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              className="fixed right-0 inset-y-0 z-[200001] w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-sky-600 to-blue-600 px-5 pb-4 pt-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold">
                      {open.title || "New Article"}
                    </div>
                    <div className="mt-0.5 text-[12px]/5 opacity-90">
                      Slug: /{open.slug}
                    </div>
                  </div>
                  <button
                    className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur hover:bg-white/20"
                    onClick={() => setOpenId(null)}
                  >
                    Close
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                    Author: {open.author}
                  </span>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                    Status: {open.status}
                  </span>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                    Updated: {new Date(open.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 pb-28 pt-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">
                          Title
                        </label>
                        <input
                          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-white "
                          value={form.title}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, title: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">
                          Slug
                        </label>
                        <input
                          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
                          value={form.slug}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, slug: e.target.value }))
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs text-gray-500 dark:text-gray-400">
                          Summary
                        </label>
                        <input
                          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
                          value={form.summary}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, summary: e.target.value }))
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs text-gray-500 dark:text-gray-400">
                          Tags (comma separated)
                        </label>
                        <input
                          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
                          value={form.tags.join(", ")}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              tags: e.target.value
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean),
                            }))
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs text-gray-500 dark:text-gray-400">
                          Content (Markdown)
                        </label>
                        <textarea
                          rows={12}
                          className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
                          value={form.content}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, content: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky footer */}
              <div className="sticky bottom-0 left-0 right-0 border-t border-gray-200 bg-white/85 px-5 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/85">
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    onClick={() => setOpenId(null)}
                  >
                    Close
                  </button>
                  <button
                    className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-medium text-white hover:bg-amber-700"
                    onClick={() => saveEdit(open.id)}
                  >
                    Save
                  </button>
                  <button
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                    onClick={() => publish(open.id)}
                  >
                    Publish
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
