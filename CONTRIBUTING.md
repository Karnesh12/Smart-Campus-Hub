# Contributing to Smart Campus Hub

First off, thank you for considering contributing to Smart Campus Hub! It's people like you who make this project great.

To maintain code quality and ensure a smooth development lifecycle, please adhere to the following guidelines.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and collaborative in all communications.

## How Can I Contribute?

### Reporting Bugs
- Search existing issues before opening a new one.
- Use the issue tracker to report bugs with a clear description, steps to reproduce, and environment details.

### Suggesting Enhancements
- Open an issue explaining the proposed feature and why it would be beneficial to the project.
- Provide mockups or design outlines if applicable.

### Pull Requests
1. Fork the repository and create a new branch from `main` (e.g., `feature/awesome-feature` or `bugfix/issue-description`).
2. Implement your changes, ensuring they align with our project guidelines.
3. Write clean, readable code and include comments where necessary.
4. Ensure all new and existing tests pass.
5. Submit a pull request targeting the `main` branch. Provide a detailed explanation of the changes made and reference any relevant issues.

## Development & Code Guidelines

### Backend (Spring Boot)
- **Java Version:** Java 21
- **Framework:** Spring Boot 4.0.x
- **Build Tool:** Maven
- **Code Style:** Follow standard Java naming conventions and use Lombok annotations where appropriate to reduce boilerplate.
- **Validation:** Always validate API request bodies using Jakarta validation annotations (e.g., `@Valid`, `@NotBlank`, `@Min`).
- **REST Endpoints:** Ensure REST endpoints are RESTful, return appropriate HTTP statuses, and utilize exception handlers for error mapping.

### Frontend (React + Vite)
- **Framework:** React 19 + Vite
- **HTTP Client:** Axios (configured with interceptors for JWT injection)
- **State Management:** React Context API (e.g., Auth Context)
- **Code Style:** Use ESLint for linting and code formatting. Run `npm run lint` before committing.
- **Routing:** Use React Router DOM for page navigation.

### Database
- **DBMS:** MySQL
- **ORM:** Spring Data JPA / Hibernate
- **Schema Changes:** Ensure that updates are compatible with existing tables. Modify models and verify the DDL auto updates smoothly.

## Testing Guidelines

Before submitting your contributions, please run the following test commands:
- **Backend Tests:**
  ```bash
  mvn test
  ```
- **Frontend Linter:**
  ```bash
  npm run lint
  ```

Thank you for helping us build a smarter campus!
