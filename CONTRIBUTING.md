# Contributing to LogicFlow

Thanks for your interest in contributing to LogicFlow. This is a student project built with HTML5, CSS3, and JavaScript. Contributions should support the project's digital logic simulation goals and keep it usable as a static website.

## Development Workflow

1. Read the project README and check the current issues or project discussion before starting substantial work.
2. Create a branch from the current default branch using one of the naming patterns below.
3. Make a focused change in the responsible member folder. Keep shared infrastructure in `shared/` and application startup/integration in `app/`. Do not add frameworks or backend services.
4. Run the project and the logic test page locally with a static web server. Test the changed behavior in a browser.
5. Commit your changes and open a pull request against the default branch.

## Branch Naming

Use a short, lowercase name with a category prefix. Separate words with hyphens.

- `feature/gate-system`
- `feature/circuit-canvas`
- `feature/simulation-engine`
- `feature/save-load`
- `fix/wire-connection`
- `docs/readme`
- `feature/parikshit-integration`
- `feature/gunish-ui`
- `feature/mohammad-simulation`
- `feature/mohit-combinational`
- `feature/madhav-sequential`

See [docs/team-structure.md](docs/team-structure.md) for ownership folders and integration points. Branches should primarily change their owner's folder; keep any required `app/` or `shared/` integration changes small and coordinated.

## Commit Messages

Use a concise imperative subject line. Prefix the subject with a category where it helps identify the change:

- `feat: add gate selection controls`
- `fix: preserve wire endpoints when moving a gate`
- `docs: clarify local setup instructions`
- `test: cover XOR truth table`

Keep each commit focused on one logical change.

## Code Style

- Use semantic HTML and preserve accessible names, labels, and keyboard behavior.
- Use consistent, readable indentation and descriptive names in JavaScript.
- Keep CSS selectors and JavaScript modules focused on their responsibilities.
- Avoid unnecessary dependencies; the project is intended to use browser-native HTML, CSS, and JavaScript.
- Do not include credentials, private data, or generated files in a change.

## Testing

Run the no-dependency browser logic suite at `team/Madhav-Gupta/testing/test-runner.html` through a static server. Also check the browser console and manually test affected UI paths. For circuit behavior, compare relevant input combinations with the expected truth table and verify connected outputs update as intended. Mention automated and manual checks in the pull request.

## Pull Requests

- Explain the problem and the approach taken.
- Link any related issue or discussion.
- List the manual or automated checks performed and any known limitations.
- Include screenshots or a short recording for visible interface changes when useful.
- Keep the pull request focused and small enough to review.
- Be open to review feedback and update the branch as needed.

## Keep Changes Focused

Avoid bundling unrelated cleanup, formatting changes, or new features into one contribution. If a larger change is needed, describe the scope and agree on the approach with the project maintainers before starting.
