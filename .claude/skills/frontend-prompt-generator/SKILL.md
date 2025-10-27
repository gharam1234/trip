---
name: frontend-prompt-generator
description: Generate structured prompts for frontend development tasks following established patterns. Use when the user requests prompts for wireframes, UI implementation, data binding, or routing functionality in React/Next.js projects with specific formatting requirements (Cursor rules, file paths, test-driven development).
---

# Frontend Prompt Generator

Generate consistent, well-structured prompts for frontend development tasks that follow established patterns for wireframe creation, UI implementation, data binding, and routing functionality.

## When to Use This Skill

Use this skill when the user wants to:
- Create prompts for frontend development tasks (wireframes, UI, data binding, routing)
- Generate prompts that follow a specific format with conditions and requirements
- Build prompts for React/Next.js components with TDD approach
- Create prompts for Figma-to-code workflows
- Generate prompts with GraphQL API integration

## Prompt Types

This skill supports four main prompt types:

1. **Wireframe**: Create HTML/flexbox wireframe structure with precise dimensions
2. **UI Implementation**: Implement Figma designs into existing wireframes using MCP
3. **Data Binding**: Bind GraphQL API data to components with TDD
4. **Routing**: Add navigation and linking functionality with TDD

## How to Use This Skill

### Step 1: Determine Prompt Type

Ask the user which type of prompt they need:
- Wireframe creation
- UI implementation (with Figma)
- Data binding (with API)
- Routing/linking functionality

### Step 2: Gather Required Information

**For Wireframe prompts:**
- Component name
- Page path to connect component
- Area structure with dimensions (width * height in px)

**For UI prompts:**
- Component name
- Figma channel name
- Figma node ID

**For Data Binding prompts:**
- Component name
- API query name
- GraphQL query structure
- Field mappings (display field → API field)
- Special handling rules (text overflow, formatting, etc.)

**For Routing prompts:**
- Component name
- Clickable element description
- ID field name for routing
- Target page pattern (e.g., /posts/[id])
- Local storage data structure (if applicable)

### Step 3: Read Templates

Always read the template reference file before generating:

```bash
view /mnt/skills/user/frontend-prompt-generator/references/prompt-templates.md
```

For additional examples, also read:

```bash
view /mnt/skills/user/frontend-prompt-generator/references/examples.md
```

### Step 4: Generate Prompt

Generate the prompt following the exact format from templates:

1. Start with standard header
2. Add condition sections with proper indentation
3. Add core requirements section
4. Use exact separator lines (46 equal signs)
5. Maintain consistent indentation (16 spaces for sub-items)
6. Use proper numbering format

### Step 5: Present and Iterate

Present the generated prompt to the user and ask if they want:
- Modifications to the prompt
- Additional prompts for related tasks
- A different prompt type

## Key Formatting Rules

- **Separators**: Use exactly 46 equal signs (`==============================================`)
- **Indentation**: 16 spaces for sub-items, 20 spaces for sub-sub-items
- **Numbering**: Use `1)`, `2)` format for main items; `1-1)`, `1-2)` for sub-items
- **Cursor rules**: Always include `@01-common.mdc` plus task-specific rules
- **File paths**: Use pattern `src/components/[component-name]/[file-type]`
- **Emphasis**: Use `**중요금지사항**` for critical warnings

## Cursor Rule Patterns

- Wireframe: `@01-common.mdc`, `@02-wireframe.mdc`
- UI: `@01-common.mdc`, `@02-wireframe.mdc`, `@03-ui.mdc`
- Functionality: `@01-common.mdc`, `@04-func.mdc`

## Common Components

All prompts include:
- Opening instruction line
- Checklist return requirement
- Condition sections (cursor rules, file paths, etc.)
- Core requirements section
- TDD specifications (for functional prompts)

## Resources

- `references/prompt-templates.md` - Detailed template patterns for each prompt type
- `references/examples.md` - Complete examples of generated prompts
