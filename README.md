# Leaks Checker

A tool by CERTUNLP to check if your organization's credentials have been leaked on the Internet.

## Description

Leaks Checker is a service that allows you to verify if an email or username from your organization has appeared in public data leaks. The system consists of a frontend (web interface) and a backend (FastAPI API), both ready to be deployed with Docker.

---

## Project Structure

```
/
├── backend/      # FastAPI backend API
├── frontend/     # Web frontend (HTML, CSS, JS)
├── .env.example  # Example environment variables
├── docker-compose.yml
```

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your_user/your_repository.git
cd your_repository
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the required values (such as `API_EXTERNAL_URL`, `RECAPTCHA_SECRET`, etc):

```bash
cp .env.example .env
```

### 3. Build and run the services with Docker

```bash
docker compose up --build
```

- The **frontend** will be available at [http://localhost:3000](http://localhost:3000)
- The **backend** will be available at [http://localhost:8000](http://localhost:8000)

---

## Customization

- Edit texts and descriptions in `frontend/index.html` or other relevant files to reflect your organization.
- Change the logos in the `frontend/img/` folder.
- Set URLs and keys in `.env`.

---

## Folder Structure

- **backend/**: Backend source code (FastAPI), Dockerfile, and dependencies.
- **frontend/**: Frontend source code, assets, Dockerfile, and config files.
- **.env.example**: Environment variables template.
- **docker-compose.yml**: Service orchestration for development and production.

---

## Main Environment Variables

- `API_EXTERNAL_URL`: URL of the internal leaks API.
- `RECAPTCHA_SECRET`: reCAPTCHA secret key.
- `ALLOWED_ORIGINS`: Allowed origins for CORS.
- Others as needed.

---

## License

GNU GPL v3.0 License. See [LICENSE](LICENSE) for details.

---

## Credits

Developed by CERTUNLP.