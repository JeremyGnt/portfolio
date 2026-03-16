# AGENTS.md

This file provides project-level guidance for Codex agents working in this repository.

## Workflow Orchestration

### 1. Plan By Default
- Use a plan for any non-trivial task, especially work with 3 or more steps or architectural decisions.
- If implementation deviates from the plan or new information invalidates it, stop and re-plan before continuing.
- Include verification in the plan, not just implementation.
- Reduce ambiguity early by writing a concrete spec before larger changes when useful.

### 2. Parallel Research And Focused Execution
- Keep the main thread focused on execution.
- Offload research, exploration, and parallel analysis when the environment supports it.
- Keep one clear objective per parallel workstream.
- Prefer approaches that reduce context sprawl and keep decisions traceable.

### 3. Self-Improvement Loop
- After a user correction, update `tasks/lessons.md` with the mistake pattern if that file exists or if creating it is appropriate for the task.
- Write short, actionable rules that would prevent repeating the same mistake.
- Reuse relevant lessons in future work on this project.

### 4. Verification Before Completion
- Do not treat work as complete without verification appropriate to the change.
- When relevant, compare previous and new behavior, not just code diff.
- Run tests, inspect logs, and gather direct evidence that the fix works.
- Hold changes to a senior-engineer quality bar.

### 5. Demand Elegance Without Over-Engineering
- For non-trivial changes, pause and check whether there is a simpler or more coherent design.
- If a fix feels brittle or hacky, prefer the cleaner solution when the added scope is justified.
- For simple issues, keep the solution direct and avoid unnecessary abstraction.

### 6. Autonomous Bug Fixing
- For bug reports, investigate the failure directly and work toward a fix without unnecessary user hand-holding.
- Use logs, errors, failing tests, and local reproduction to identify root cause.
- Prefer root-cause fixes over temporary workarounds.

## Task Management

- For non-trivial implementation tasks, write a checkable plan to `tasks/todo.md` when that workflow fits the task.
- Keep progress up to date as items are completed.
- Share concise high-level progress updates while working.
- Add a short review or outcome section to `tasks/todo.md` when that file is used.
- After user corrections, capture lessons in `tasks/lessons.md` when that workflow is active.

## Core Principles

- Simplicity first. Make the smallest change that correctly solves the problem.
- Find root causes. Avoid temporary fixes unless the user explicitly wants a stopgap.
- Minimize impact. Touch only the code necessary to implement the change safely.
- Verify before declaring success.

## Priority

- These instructions guide project work but do not override higher-priority system, developer, or tool constraints.
- Follow the actual capabilities available in the current Codex environment.
