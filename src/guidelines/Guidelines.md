---
────────────────────────────────────────────
 SYSTEM GUIDELINES
Use this file to provide the AI with rules and guidelines to follow when generating design or code assets.

 TIP: More context isn't always better. Focus on only what matters most for consistency and clarity.

────────────────────────────────────────────
#  GENERAL DEVELOPMENT GUIDELINES

These are rules and best practices for writing, structuring, and maintaining code.

* Use responsive layouts by default — prioritize **flexbox** and **CSS grid**. Use absolute positioning only when functionally required.
* Prioritize **code clarity and maintainability**. Refactor during generation where possible.
* Keep components small and focused. Extract helpers or repeated logic into reusable files.
* Always use semantic HTML elements (`<section>`, `<article>`, `<main>`, etc.)
* Use TypeScript when available for type safety and developer experience.
* Follow accessibility best practices (ARIA labels, keyboard support, contrast ratios, etc.)

---

#  DESIGN SYSTEM GUIDELINES

Rules that ensure consistency with your design system or UI/UX standards.

## Layout & Spacing

* Use an 8px spacing system
* Apply consistent padding/margin values (e.g. `px-4`, `mt-6`)
* Avoid nesting more than 3 layout containers unless necessary

## Typography

* Base font-size: `14px`
* Use rem or tailwind classes for scaling (`text-sm`, `text-lg`, etc.)
* Heading hierarchy:
  - `h1`: Page title
  - `h2`: Section heading
  - `h3`: Subsection

## Date & Time Format

* Use the format: `Oct 8` (short month, no year unless necessary)

## Color & Theme

* Use `primary`, `secondary`, and `neutral` token names — not hardcoded hex
* Ensure 4.5:1 contrast ratio minimum for text
* Support dark mode using media queries or Tailwind’s `dark:` classes

---

# COMPONENT-SPECIFIC GUIDELINES

## Button

The Button component is a core UI element. It guides user interaction and should follow consistent patterns.

### Variants

* **Primary Button**
  * Purpose: Main call-to-action
  * Style: Bold, filled, brand color
  * Usage: One per view/page

* **Secondary Button**
  * Purpose: Supporting actions
  * Style: Outlined, neutral or light background
  * Usage: Used alongside primary buttons

* **Tertiary Button**
  * Purpose: Minor or optional actions
  * Style: Text-only
  * Usage: Used in lists, footers, etc.

## Input Fields

* Labels must always be present or use placeholders for clarity
* Support validation states: error, success, loading
* Use native HTML input types where possible (`email`, `date`, `number`, etc.)

## Forms

* Forms should be responsive and easy to scan
* Group related fields into sections when necessary
* Use toast notifications or inline messages for feedback
* Keep CTA buttons sticky or visible for long forms
* Support custom fields for dynamic forms (e.g., form builder)

---

# 🧩 OPTIONAL UI PATTERNS

These are patterns you can adopt depending on the project context.

* **Chips**: Use in groups of 3+ only, for tag-style selection or filters
* **Dropdowns**: Don’t use if there are only 2 options — use radio buttons instead
* **Bottom Toolbar**: Limit to 4 icons max
* **Floating Action Button (FAB)**: Avoid if using bottom toolbar

---
