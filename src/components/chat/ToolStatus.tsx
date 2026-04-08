"use client";

import { Loader2, FilePlus, FilePen, FileSearch, FileX, FileOutput } from "lucide-react";

interface ToolStatusProps {
  toolName: string;
  args: Record<string, any>;
  state: string;
  result?: any;
}

function getFileAction(toolName: string, args: Record<string, any>): { label: string; icon: typeof FilePlus } {
  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return { label: `Creating ${args.path || "file"}`, icon: FilePlus };
      case "str_replace":
        return { label: `Editing ${args.path || "file"}`, icon: FilePen };
      case "insert":
        return { label: `Editing ${args.path || "file"}`, icon: FilePen };
      case "view":
        return { label: `Reading ${args.path || "file"}`, icon: FileSearch };
      default:
        return { label: `Modifying ${args.path || "file"}`, icon: FilePen };
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename":
        return { label: `Renaming ${args.path || "file"} → ${args.new_path || ""}`, icon: FileOutput };
      case "delete":
        return { label: `Deleting ${args.path || "file"}`, icon: FileX };
      default:
        return { label: `Managing ${args.path || "file"}`, icon: FilePen };
    }
  }

  return { label: toolName, icon: FilePen };
}

function completedLabel(toolName: string, args: Record<string, any>): string {
  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return `Created ${args.path || "file"}`;
      case "str_replace":
        return `Edited ${args.path || "file"}`;
      case "insert":
        return `Edited ${args.path || "file"}`;
      case "view":
        return `Read ${args.path || "file"}`;
      default:
        return `Modified ${args.path || "file"}`;
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename":
        return `Renamed ${args.path || "file"} → ${args.new_path || ""}`;
      case "delete":
        return `Deleted ${args.path || "file"}`;
      default:
        return `Managed ${args.path || "file"}`;
    }
  }

  return toolName;
}

export function ToolStatus({ toolName, args, state, result }: ToolStatusProps) {
  const isComplete = state === "result" && result;
  const { label: activeLabel, icon: Icon } = getFileAction(toolName, args);
  const label = isComplete ? completedLabel(toolName, args) : activeLabel;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <Icon className="w-3 h-3 text-neutral-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <Icon className="w-3 h-3 text-neutral-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
