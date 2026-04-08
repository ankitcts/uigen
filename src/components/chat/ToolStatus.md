# ToolStatus Component

Renders a user-friendly status indicator for AI tool invocations in chat messages. Instead of showing raw tool names like `str_replace_editor`, it displays contextual messages like "Created /App.jsx" or "Editing /components/Card.jsx".

## Props

| Prop       | Type                  | Required | Description                                          |
|------------|-----------------------|----------|------------------------------------------------------|
| `toolName` | `string`              | Yes      | The tool identifier (e.g. `"str_replace_editor"`)    |
| `args`     | `Record<string, any>` | Yes      | Tool arguments containing `command`, `path`, etc.    |
| `state`    | `string`              | Yes      | Execution state: `"pending"`, `"streaming"`, `"result"` |
| `result`   | `any`                 | No       | Tool result. Presence with `state="result"` marks completion |

## Supported Tools

### `str_replace_editor`

| Command       | In Progress         | Completed          |
|---------------|---------------------|--------------------|
| `create`      | Creating /path      | Created /path      |
| `str_replace` | Editing /path       | Edited /path       |
| `insert`      | Editing /path       | Edited /path       |
| `view`        | Reading /path       | Read /path         |

### `file_manager`

| Command  | In Progress                  | Completed                    |
|----------|------------------------------|------------------------------|
| `rename` | Renaming /old → /new         | Renamed /old → /new          |
| `delete` | Deleting /path               | Deleted /path                |

Unknown tools fall back to displaying the raw `toolName`.

## Usage

```tsx
import { ToolStatus } from "@/components/chat/ToolStatus";

// In progress
<ToolStatus
  toolName="str_replace_editor"
  args={{ command: "create", path: "/App.jsx" }}
  state="pending"
/>

// Completed
<ToolStatus
  toolName="str_replace_editor"
  args={{ command: "create", path: "/App.jsx" }}
  state="result"
  result="File created: /App.jsx"
/>

// File rename
<ToolStatus
  toolName="file_manager"
  args={{ command: "rename", path: "/old.jsx", new_path: "/new.jsx" }}
  state="result"
  result={{ success: true }}
/>
```

## Extending

To support a new tool, add a case in both `getFileAction()` (in-progress label + icon) and `completedLabel()` (completed label) inside `ToolStatus.tsx`.
