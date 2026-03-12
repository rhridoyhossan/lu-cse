"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Terminal, Shield, Database, Calendar, BookOpen, List, User, Plus, Edit2, Trash2, Save, UploadCloud, Link as LinkIcon, LogOut } from "lucide-react";

const SHEET_CATEGORIES = ["General", "Events", "Resources"] as const;
type Category = (typeof SHEET_CATEGORIES)[number];
type ViewMode = "All" | "Mine" | "Add" | "Edit";

const SHEET_COLUMNS = {
  General: ["Title", "Image URL(Optional)", "Link(Optional)"],
  Events: [
    "Title",
    "Description",
    "Type",
    "Event Date",
    "Register Deadline",
    "Image URL(Optional)",
    "Link",
    "Location",
  ],
  Resources: ["Title", "Format", "Tags", "Link"],
};

const CategoryIcons = {
  General: Database,
  Events: Calendar,
  Resources: BookOpen,
};

export default function ClientDashboard({
  currentUser,
  userName,
  initialData,
}: any) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>("General");
  const [viewMode, setViewMode] = useState<ViewMode>("All");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRow, setEditingRow] = useState<any>(null);

  const [uploadMode, setUploadMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const currentData = initialData[activeCategory] || [];
  const myData = currentData.filter((row: any) => row["Added By"] === currentUser && row.Title);
  const displayData = viewMode === "Mine" ? myData : currentData.filter((row: any) => row.Title);

  useEffect(() => {
    if (viewMode === "Edit" && editingRow) {
      setImageUrl(editingRow["Image URL(Optional)"] || "");
    } else {
      setImageUrl("");
    }
  }, [viewMode, editingRow]);

  const apiFetch = async (url: string, options: RequestInit) => {
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-internal-token": process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || "",
        ...options.headers,
      },
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          "x-internal-token": process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || "",
        },
      });
      const data = await res.json();

      if (data.url) {
        setImageUrl(data.url);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error(error);
      alert("ERR_UPLOAD_FAILED: Could not upload to image server.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const dataObj: Record<string, string> = {};
    formData.forEach((value, key) => {
      dataObj[key] = value.toString();
    });

    if (activeCategory !== "Resources") {
      dataObj["Image URL(Optional)"] = imageUrl;
    }

    try {
      const isEdit = viewMode === "Edit" && editingRow;
      const res = await apiFetch("/api/sheets", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify({
          tab: activeCategory,
          formData: dataObj,
          rowIndex: isEdit ? editingRow._rowIndex : undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to save via API");

      setViewMode("Mine");
      setEditingRow(null);
      setImageUrl("");
      setUploadMode(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("ERR_DB_WRITE_FAILED: Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (rowIndex: number) => {
    if (!confirm("WARN: Executing delete operation. Proceed?")) return;
    try {
      const res = await apiFetch(
        `/api/sheets?tab=${activeCategory}&rowIndex=${rowIndex}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Failed to delete via API");
      router.refresh();
    } catch (error) {
      alert("ERR_DB_DELETE_FAILED");
    }
  };

  const handleEditClick = (row: any) => {
    setEditingRow(row);
    setViewMode("Edit");
  };

  return (
    <div className="flex flex-col md:flex-row flex-1 bg-slate-950 text-slate-200 font-mono overflow-hidden relative">
      <div className="absolute top-0 right-0 w-160 h-160 bg-cyan-900/10 blur-[120px] rounded-full pointer-events-none" />

      <aside className="w-full md:w-64 bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col z-10 backdrop-blur-sm shrink-0">
        <div className="p-4 md:p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Shield size={16} />
            </div>
            <div>
              <h2
                className="text-lg font-bold text-white uppercase tracking-wider glitch"
                data-text="SYS_ADMIN"
              >
                SYS_ADMIN
              </h2>
              <p className="text-[9px] text-cyan-500/80 uppercase tracking-widest mt-0.5">
                Control Panel
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1 p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
            <span className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider">
              <User size={10} /> Name:{" "}
              <span className="text-cyan-400 font-bold truncate">
                {userName}
              </span>
            </span>
            <span className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider">
              <Terminal size={10} /> ID:{" "}
              <span className="text-slate-300 truncate">{currentUser}</span>
            </span>
          </div>
        </div>

        <nav className="flex-row md:flex-col flex overflow-x-auto md:overflow-visible p-2 md:p-4 gap-1 md:gap-2 no-scrollbar">
          {SHEET_CATEGORIES.map((category) => {
            const Icon = CategoryIcons[category];
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setViewMode("All");
                  setEditingRow(null);
                  setUploadMode(false);
                }}
                className={`cursor-pointer flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                    : "text-slate-400 hover:bg-slate-800/50 border border-transparent hover:text-slate-200"
                }`}
              >
                <Icon
                  size={14}
                  className={
                    isActive
                      ? "text-cyan-400 shrink-0"
                      : "text-slate-500 shrink-0"
                  }
                />
                {category}
              </button>
            );
          })}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="cursor-pointer flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 md:mt-auto rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap text-red-500 hover:bg-red-950/40 border border-transparent hover:border-red-500/30 hover:text-red-400"
        >
          <LogOut size={14} className="shrink-0" />
          Logout()
        </button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative z-10">
        <header className="mb-6 md:mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
              <span className="text-cyan-500">/</span>
              {activeCategory}_DB
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest">
              Manage records and entries for {activeCategory.toLowerCase()}
            </p>
          </div>

          <div className="flex space-x-1 bg-slate-900/80 border border-slate-800 p-1.5 rounded-xl w-fit backdrop-blur-sm overflow-x-auto no-scrollbar max-w-full">
            {[
              { mode: "All", icon: List, label: "View All" },
              { mode: "Mine", icon: User, label: "My Entries" },
              {
                mode: viewMode === "Edit" ? "Edit" : "Add",
                icon: viewMode === "Edit" ? Edit2 : Plus,
                label: viewMode === "Edit" ? "Editing" : "Add New",
              },
            ].map(({ mode, icon: Icon, label }) => {
              const isActive =
                viewMode === mode || (mode === "Add" && viewMode === "Edit");
              return (
                <button
                  key={mode}
                  onClick={() => {
                    setViewMode(mode as ViewMode);
                    if (mode !== "Edit") setEditingRow(null);
                  }}
                  className={`cursor-pointer flex items-center gap-2 px-3 md:px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-cyan-950/50 text-cyan-400 border border-cyan-500/30 shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <Icon size={14} className="shrink-0" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </header>

        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-[0_0_30px_rgba(0,0,0,0.2)] backdrop-blur-md min-h-100">
          {viewMode === "Add" || viewMode === "Edit" ? (
            <form
              onSubmit={handleSubmit}
              className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-3xl space-y-6"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  {viewMode === "Edit" ? (
                    <Edit2 size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                </div>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                  {viewMode === "Edit" ? "Update_Record()" : "Insert_Record()"}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SHEET_COLUMNS[activeCategory].map((column) => {
                  const isOptional = column.includes("Optional");
                  const cleanLabel = column.replace("(Optional)", "");
                  const defaultValue = editingRow ? editingRow[column] : "";

                  if (column === "Image URL(Optional)") {
                    return (
                      <div
                        key={column}
                        className="space-y-2 group col-span-1 md:col-span-2 p-4 rounded-xl border border-slate-800 bg-slate-950/30"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-cyan-400 transition-colors">
                            {cleanLabel}{" "}
                            {!isOptional && (
                              <span className="text-cyan-500">*</span>
                            )}
                          </label>
                          <button
                            type="button"
                            onClick={() => setUploadMode(!uploadMode)}
                            className="cursor-pointer flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-cyan-500 hover:text-cyan-300 transition-colors bg-cyan-950/30 px-3 py-1.5 rounded-lg border border-cyan-500/20"
                          >
                            {uploadMode ? (
                              <>
                                <LinkIcon size={12} /> Switch to URL
                              </>
                            ) : (
                              <>
                                <UploadCloud size={12} /> Switch to Upload
                              </>
                            )}
                          </button>
                        </div>

                        {uploadMode ? (
                          <div className="space-y-3">
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                              onChange={handleFileUpload}
                              className="w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-950/40 file:text-cyan-400 hover:file:bg-cyan-900/60 transition-all cursor-pointer bg-slate-900/50 rounded-xl border border-dashed border-slate-700 p-2"
                            />
                            {isUploading && (
                              <p className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse font-bold tracking-widest">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"/>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"/>
                                </span>
                                UPLOADING_TO_SERVER...
                              </p>
                            )}
                            {imageUrl && !isUploading && (
                              <p className="text-xs text-green-400 truncate max-w-full block">
                                Ready: {imageUrl}
                              </p>
                            )}
                          </div>
                        ) : (
                          <input
                            type="text"
                            name={column}
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            autoComplete="off"
                            placeholder="https://example.com/image.png"
                            className="w-full rounded-xl bg-slate-950/80 border border-slate-800 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all placeholder:text-slate-700"
                          />
                        )}
                      </div>
                    );
                  }

                  if (activeCategory === "Resources" && column === "Format") {
                    return (
                      <div key={column} className="space-y-2 group">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-cyan-400 transition-colors">
                          {cleanLabel}{" "}
                          {!isOptional && (
                            <span className="text-cyan-500">*</span>
                          )}
                        </label>
                        <select
                          name={column}
                          required
                          defaultValue={defaultValue || ""}
                          className="w-full rounded-xl bg-slate-950/80 border border-slate-800 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all appearance-none"
                        >
                          <option value="" disabled className="bg-slate-900">
                            Select Format
                          </option>
                          {["Book", "Video", "PDF", "Article", "Tool"].map(
                            (opt) => (
                              <option
                                key={opt}
                                value={opt}
                                className="bg-slate-900"
                              >
                                {opt}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    );
                  }

                  return (
                    <div key={column} className="space-y-2 group">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-cyan-400 transition-colors">
                        {cleanLabel}{" "}
                        {!isOptional && (
                          <span className="text-cyan-500">*</span>
                        )}
                      </label>
                      <input
                        type="text"
                        name={column}
                        required={!isOptional}
                        defaultValue={defaultValue}
                        autoComplete="off"
                        placeholder={`Enter ${cleanLabel.toLowerCase()}...`}
                        className="w-full rounded-xl bg-slate-950/80 border border-slate-800 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all placeholder:text-slate-700"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="cursor-pointer group relative overflow-hidden rounded-xl bg-cyan-950/40 border border-cyan-500/50 px-6 py-3 text-xs font-bold text-cyan-400 uppercase tracking-widest hover:bg-cyan-900/60 hover:border-cyan-400 hover:text-cyan-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <div className="absolute inset-0 bg-cyan-400/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 relative z-10">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                      </span>
                      Committing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 relative z-10">
                      <Save size={14} />
                      {viewMode === "Edit"
                        ? "Save_Changes()"
                        : "Commit_Entry()"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          ) : displayData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                <Database size={24} className="text-slate-600" />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
                NO_DATA_FOUND
              </p>
              <p className="text-xs text-slate-500">
                The current query returned 0 results.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50 animate-in fade-in duration-500">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80">
                    {Object.keys(displayData[0])
                      .filter((k) => k !== "_rowIndex")
                      .map((key) => (
                        <th
                          key={key}
                          className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap"
                        >
                          {key}
                        </th>
                      ))}
                    {viewMode === "Mine" && (
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-slate-800/50">
                  {displayData.map((row: any, i: number) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-800/30 transition-colors group/row"
                    >
                      {Object.entries(row).map(([key, value]) => {
                        if (key === "_rowIndex") return null;
                        return (
                          <td
                            key={key}
                            className="p-4 text-slate-300 max-w-50 truncate"
                          >
                            {typeof value === "string" &&
                            value.startsWith("http") ? (
                              <a
                                href={value}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline underline-offset-4"
                              >
                                [Link]
                              </a>
                            ) : (
                              (value as React.ReactNode)
                            )}
                          </td>
                        );
                      })}

                      {viewMode === "Mine" && (
                        <td className="p-4 text-right whitespace-nowrap space-x-3">
                          <button
                            type="button"
                            onClick={() => handleEditClick(row)}
                            className="cursor-pointer inline-flex items-center gap-1 text-sm font-bold uppercase tracking-widest text-cyan-500 hover:text-cyan-300 transition-colors"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row._rowIndex)}
                            className="cursor-pointer inline-flex items-center gap-1 text-sm font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </td>
                      )}

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
