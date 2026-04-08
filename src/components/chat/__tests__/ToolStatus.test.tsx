import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolStatus } from "../ToolStatus";

afterEach(() => {
  cleanup();
});

// str_replace_editor: create
test("shows 'Creating <path>' when str_replace_editor create is in progress", () => {
  render(
    <ToolStatus
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="pending"
    />
  );
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("shows 'Created <path>' when str_replace_editor create is complete", () => {
  render(
    <ToolStatus
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result="File created: /App.jsx"
    />
  );
  expect(screen.getByText("Created /App.jsx")).toBeDefined();
});

// str_replace_editor: str_replace
test("shows 'Editing <path>' when str_replace_editor str_replace is in progress", () => {
  render(
    <ToolStatus
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/components/Card.jsx" }}
      state="pending"
    />
  );
  expect(screen.getByText("Editing /components/Card.jsx")).toBeDefined();
});

test("shows 'Edited <path>' when str_replace_editor str_replace is complete", () => {
  render(
    <ToolStatus
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/components/Card.jsx" }}
      state="result"
      result="Replaced 1 occurrence(s)"
    />
  );
  expect(screen.getByText("Edited /components/Card.jsx")).toBeDefined();
});

// str_replace_editor: insert
test("shows 'Editing <path>' when str_replace_editor insert is in progress", () => {
  render(
    <ToolStatus
      toolName="str_replace_editor"
      args={{ command: "insert", path: "/utils.js", insert_line: 5 }}
      state="pending"
    />
  );
  expect(screen.getByText("Editing /utils.js")).toBeDefined();
});

// str_replace_editor: view
test("shows 'Reading <path>' when str_replace_editor view is in progress", () => {
  render(
    <ToolStatus
      toolName="str_replace_editor"
      args={{ command: "view", path: "/index.tsx" }}
      state="pending"
    />
  );
  expect(screen.getByText("Reading /index.tsx")).toBeDefined();
});

test("shows 'Read <path>' when str_replace_editor view is complete", () => {
  render(
    <ToolStatus
      toolName="str_replace_editor"
      args={{ command: "view", path: "/index.tsx" }}
      state="result"
      result="1\tconst x = 1;"
    />
  );
  expect(screen.getByText("Read /index.tsx")).toBeDefined();
});

// file_manager: rename
test("shows rename label with both paths when file_manager rename is in progress", () => {
  render(
    <ToolStatus
      toolName="file_manager"
      args={{ command: "rename", path: "/old.jsx", new_path: "/new.jsx" }}
      state="pending"
    />
  );
  expect(screen.getByText("Renaming /old.jsx → /new.jsx")).toBeDefined();
});

test("shows renamed label when file_manager rename is complete", () => {
  render(
    <ToolStatus
      toolName="file_manager"
      args={{ command: "rename", path: "/old.jsx", new_path: "/new.jsx" }}
      state="result"
      result={{ success: true }}
    />
  );
  expect(screen.getByText("Renamed /old.jsx → /new.jsx")).toBeDefined();
});

// file_manager: delete
test("shows 'Deleting <path>' when file_manager delete is in progress", () => {
  render(
    <ToolStatus
      toolName="file_manager"
      args={{ command: "delete", path: "/trash.jsx" }}
      state="pending"
    />
  );
  expect(screen.getByText("Deleting /trash.jsx")).toBeDefined();
});

test("shows 'Deleted <path>' when file_manager delete is complete", () => {
  render(
    <ToolStatus
      toolName="file_manager"
      args={{ command: "delete", path: "/trash.jsx" }}
      state="result"
      result={{ success: true }}
    />
  );
  expect(screen.getByText("Deleted /trash.jsx")).toBeDefined();
});

// Fallback for unknown tools
test("falls back to toolName for unknown tools", () => {
  render(
    <ToolStatus
      toolName="some_other_tool"
      args={{ command: "do_stuff" }}
      state="pending"
    />
  );
  expect(screen.getByText("some_other_tool")).toBeDefined();
});

// Green dot indicator for completed state
test("renders green dot when complete", () => {
  const { container } = render(
    <ToolStatus
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result="File created"
    />
  );
  const dot = container.querySelector(".bg-emerald-500");
  expect(dot).toBeDefined();
});

// Spinner for in-progress state
test("renders spinner when in progress", () => {
  const { container } = render(
    <ToolStatus
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="pending"
    />
  );
  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeDefined();
});

// Missing path fallback
test("shows 'file' when path is missing from args", () => {
  render(
    <ToolStatus
      toolName="str_replace_editor"
      args={{ command: "create" }}
      state="pending"
    />
  );
  expect(screen.getByText("Creating file")).toBeDefined();
});
