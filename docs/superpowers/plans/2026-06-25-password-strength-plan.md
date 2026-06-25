# Password Strength Meter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a password strength function and update the strength bar UI in the registration form without changing any other functionality.

**Architecture:** Use a score-based evaluation (0 to 4) of password requirements, and map active segments of the indicator using a dark-to-light green gradient.

**Tech Stack:** React, Next.js, react-hook-form, TailwindCSS.

## Global Constraints
- Only touch the password strength calculation and password meter styling in `RegisterForm.tsx`.
- Fix the Next.js module import error in `RegisterForm.tsx` by marking it as `"use client";`.
- Add local state for `formError` and `isLoading` in `RegisterForm.tsx` to fix typescript errors, without changing existing form structure.

---

### Task 1: Update RegisterForm.tsx

**Files:**
- Modify: `website/client/features/auth/components/registerForm.tsx`

**Interfaces:**
- Consumes: None
- Produces: Updated register form UI and validation logic.

- [ ] **Step 1: Modify RegisterForm.tsx to implement the password strength logic and color scheme**
  We will add `"use client";` at the top, import `useState` from `"react"`, add `getPasswordStrength` helper, extract `password`, and map the segment background colors dynamically based on the score.

- [ ] **Step 2: Verify typescript compilation**
  Run: `npx tsc --noEmit`
  Expected: Command succeeds with no errors.
