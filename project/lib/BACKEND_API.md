# Driving School Management System; Backend API Guide

this document explains how frontend should talk to the Node.js/Express API that lives in `project/lib`.

> **Base URL**: `http://localhost:<PORT>/api/v1` 
>(see `.env.example` for the exact `PORT`).

Most endpoints are protected. Always include `Authorization: Bearer <JWT>` except for `/auth/login`, `/auth/register`, and `/health`.

## 1. how to start the backend

1. Run the backend (from `project/lib`): `npm install && npm run dev`, dont forget to create `.env` file and configure it.
2. Copy `.env.example` to `.env` and set:
   - `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `DEFAULT_PAGE_SIZE`, `CORS_ORIGIN`.
3. Once the server starts with no errors you can inspect Swagger docs at `/api-docs` for live schemas.

## 2. Shared Conventions

- **Headers**: `Content-Type: application/json` + `Authorization: Bearer <token>` when required.
- **Pagination**: standard `page` (default 1) and `limit` (default `DEFAULT_PAGE_SIZE`). Responses include `pagination` with `page`, `limit`, `total`, `pages`.
- **Filtering & Sorting**: many list endpoints accept `search`, `status`, `licenseType`, `sortBy`, etc., as noted below.
- **Dates**: send ISO 8601 strings (`2025-01-15T09:00:00.000Z`) unless the controller specifically asks for `YYYY-MM-DD` and `HH:MM` (lessons).
- **Errors**: failures follow `{ success: false, error: "message" }` with appropriate HTTP codes (see `middleware/error.middleware.js`). Validation issues return code `400`.
