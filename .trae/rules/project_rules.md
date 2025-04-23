# Project Rules

## 1. General Principles
- **Clarity & Maintainability:** All code must be readable, well-structured, and commented where necessary.
- **Consistency:** Follow established naming conventions and code style guidelines for JavaScript/TypeScript, React, Node.js, and Tailwind CSS.
- **Atomic Commits:** Make frequent, small commits with clear messages describing the change.

## 2. File & Folder Structure
- **Frontend and backend code must be separated** into clearly named directories (e.g., `/frontend`, `/backend`).
- **Organize by feature/domain** where possible for scalability.
- **Assets, components, hooks, utils, and services** should have dedicated folders.
- **Database files** (e.g., `mydb.db`) are stored in a `/data` directory in the backend.

## 3. Coding Standards
- **Frontend:** Use React functional components, hooks, and TypeScript (if enabled).
- **Styling:** Use Tailwind CSS classes; avoid inline styles unless necessary.
- **UI Components:** Use Shadcn UI and Magic UI for all reusable UI elements.
- **Backend:** Use Hono framework conventions; keep routes, controllers, and services modular.
- **Database:** Use parameterized queries to prevent SQL injection.

## 4. Environment & Configuration
- **Editor:** Use Cursor editor for all development.
- **Environment Variables:** Store sensitive data in `.env` files, never commit them to version control.
- **.cursorrules:** Maintain and update `.cursorrules` as the project evolves.

## 5. Workflow & Collaboration
- **Branching:** Use feature branches for new features and bugfixes; merge via pull requests.
- **Code Reviews:** All code must be reviewed by at least one other team member before merging.
- **Issue Tracking:** Use the project’s issue tracker to document bugs, tasks, and enhancements.

## 6. Testing & Quality Assurance
- **Manual Testing:** All major features must be tested manually before merging.
- **Automated Testing:** Add automated tests where feasible, especially for business logic.
- **Linting:** Use ESLint and Prettier; code must pass linting before merge.

## 7. Documentation
- **Update README.md** with setup, usage, and deployment instructions.
- **Document all endpoints and data models** in a dedicated `/docs` directory.
- **Add comments** to complex code sections.

## 8. Security & Privacy
- **Data Protection:** Never log sensitive client or technician information.
- **Authentication:** Secure all endpoints that handle personal data.
- **Third-Party Services:** Use secure APIs and follow best practices for integration.

## 9. Deployment
- **Database Initialization:** Backend must auto-create `mydb.db` if missing.
- **Environment:** Ensure all environment variables are set in production.

## 10. Language Requirement
- **Website Language:** The entire website (UI, notifications, emails) must be in French. All user-facing text and content should be written and displayed in French.

