# Password Strength Check & UI Redesign

Implement a password strength evaluation function in the registration form and redesign the strength bar indicator to use a retro green gradient (from dark green to light green).

## User Review Required

No critical breaking changes. The registration form component will be updated to fully compile and function correctly.

## Proposed Changes

### website/client

#### [MODIFY] [registerForm.tsx](file:///home/nquocbao37/Code/PixelMart/website/client/features/auth/components/registerForm.tsx)

- Add `"use client";` at the top of the file to mark it as a client component in Next.js.
- Import `useState` from `"react"` and `useRouter` from `"next/navigation"`.
- Implement a helper function `getPasswordStrength(password: string): number` that evaluates the password based on four criteria:
  1. Minimum length of 8 characters
  2. At least 1 uppercase letter
  3. At least 1 lowercase letter
  4. At least 1 number
- Inside `RegisterForm`:
  - Watch the password input using `const password = form.watch("password") || "";`.
  - Calculate `passwordStrength` and set `passwordIsStrong` when strength score is `4`.
  - Declare state for `isLoading` and `formError` to fix compile errors.
  - Redesign the password strength bar indicator. When a segment at index `i` is active (i.e. `passwordStrength > i`), color it based on a dark-to-light green gradient:
    - Index 0: Dark Green (`bg-[#14532d]`)
    - Index 1: Medium Dark Green (`bg-[#15803d]`)
    - Index 2: Medium Green (`bg-[#22c55e]`)
    - Index 3: Light Green (`bg-neon-green`)

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to verify all compilation errors are resolved.

### Manual Verification
- Launch the dev server, type in the password field, and observe the indicator changing segment colors from dark green to light green as requirements are met.
