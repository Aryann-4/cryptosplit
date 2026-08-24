# Contributing to CryptoSplit

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies: `cd app && npm install`
4. Start the dev server: `npm run dev`
5. Run tests: `npm test`

## Code Style

- TypeScript strict mode
- Functional components with hooks
- Tailwind CSS for styling
- No external state management libraries

## Testing

- Frontend tests: `cd app && npm test`
- Contract logic tests: `npm test` (root)
- Type checking: `cd app && npx tsc --noEmit`

All tests must pass before submitting a PR.

## Commit Messages

Use conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `test:` for adding tests
- `refactor:` for code refactoring

## Pull Requests

1. Create a feature branch from `main`
2. Make your changes
3. Add tests if applicable
4. Ensure all tests pass
5. Submit a PR with a clear description

## Reporting Issues

- Use GitHub Issues
- Include steps to reproduce
- Include browser/OS information
- For security issues, see SECURITY.md

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
