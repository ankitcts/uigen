import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MainContent } from "@/app/main-content";

// Mock ResizeObserver which is used by react-resizable-panels
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock the Tabs UI components with simple interactive elements
// to decouple state-switching logic from Radix UI's jsdom limitations
vi.mock("@/components/ui/tabs", () => {
  const React = require("react");
  const TabsContext = React.createContext<{
    value?: string;
    onValueChange?: (v: string) => void;
  }>({});

  return {
    Tabs: ({ children, value, onValueChange }: any) => (
      <TabsContext.Provider value={{ value, onValueChange }}>
        <div data-slot="tabs" data-value={value}>
          {children}
        </div>
      </TabsContext.Provider>
    ),
    TabsList: ({ children, className }: any) => (
      <div role="tablist" className={className}>
        {children}
      </div>
    ),
    TabsTrigger: ({ children, value, className }: any) => {
      const ctx = React.useContext(TabsContext);
      return (
        <button
          role="tab"
          data-slot="tabs-trigger"
          data-state={ctx.value === value ? "active" : "inactive"}
          className={className}
          onClick={() => ctx.onValueChange?.(value)}
        >
          {children}
        </button>
      );
    },
    TabsContent: ({ children }: any) => <div>{children}</div>,
  };
});

// Mock child components that aren't under test
vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">Preview Frame</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">File Tree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">Code Editor</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions">Header Actions</div>,
}));

vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

async function renderMainContent() {
  await act(async () => {
    render(<MainContent />);
  });
}

test("renders Preview and Code toggle buttons", async () => {
  await renderMainContent();

  expect(screen.getByText("Preview")).toBeDefined();
  expect(screen.getByText("Code")).toBeDefined();
});

test("shows preview pane by default", async () => {
  await renderMainContent();

  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("clicking Code button switches to code view", async () => {
  await renderMainContent();

  await act(async () => {
    fireEvent.click(screen.getByText("Code"));
  });

  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.queryByTestId("preview-frame")).toBeNull();
});

test("clicking Preview button switches back to preview after being on code view", async () => {
  await renderMainContent();

  // Switch to code view
  await act(async () => {
    fireEvent.click(screen.getByText("Code"));
  });
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Switch back to preview
  await act(async () => {
    fireEvent.click(screen.getByText("Preview"));
  });

  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("toggling multiple times works correctly", async () => {
  await renderMainContent();

  for (let i = 0; i < 3; i++) {
    await act(async () => {
      fireEvent.click(screen.getByText("Code"));
    });
    expect(screen.getByTestId("code-editor")).toBeDefined();
    expect(screen.queryByTestId("preview-frame")).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByText("Preview"));
    });
    expect(screen.getByTestId("preview-frame")).toBeDefined();
    expect(screen.queryByTestId("code-editor")).toBeNull();
  }
});

test("Preview button has active data-state when on preview view", async () => {
  await renderMainContent();

  const previewTrigger = screen.getByRole("tab", { name: "Preview" });
  expect(previewTrigger.getAttribute("data-state")).toBe("active");

  const codeTrigger = screen.getByRole("tab", { name: "Code" });
  expect(codeTrigger.getAttribute("data-state")).toBe("inactive");
});

test("Code button has active data-state after clicking it", async () => {
  await renderMainContent();

  await act(async () => {
    fireEvent.click(screen.getByText("Code"));
  });

  const codeTrigger = screen.getByRole("tab", { name: "Code" });
  expect(codeTrigger.getAttribute("data-state")).toBe("active");

  const previewTrigger = screen.getByRole("tab", { name: "Preview" });
  expect(previewTrigger.getAttribute("data-state")).toBe("inactive");
});

test("file tree and code editor are both shown in code view", async () => {
  await renderMainContent();

  await act(async () => {
    fireEvent.click(screen.getByText("Code"));
  });

  expect(screen.getByTestId("file-tree")).toBeDefined();
  expect(screen.getByTestId("code-editor")).toBeDefined();
});
