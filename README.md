# CareerSync

CareerSync is a full-stack, production-ready application designed to transform the job-hunting process into a data-driven pipeline. It prioritizes data integrity, responsive UI performance, and secure, stateless authentication.

## Live Demo
* **URL:** [CareerSync](https://job-tracker-pink-six.vercel.app/)
* **Demo Access:** Use the "View Demo" button on the landing page for instant, one-click access to a pre-populated dashboard.

## Why I Made This
The job search process is often chaotic, usually fragmented across spreadsheets, emails, and browser tabs. I built CareerSync to solve three core problems:
1. **Pipeline Blindness:** Without centralized tracking, it's easy to lose track of application stages, interview rounds, and critical follow-up dates.
2. **Context Switching:** I wanted a single, high-density dashboard that provides an immediate "at-a-glance" view of my pipeline health without opening multiple tools.
3. **Engineering Rigor:** Beyond the utility, this project was a dedicated exercise in implementing professional engineering patterns—specifically stateless authentication, server-state synchronization with TanStack Query, and relational data modeling with Prisma—to create a tool that is as robust as it is useful.

## Engineering Highlights & Trade-offs
We architected CareerSync to address common pitfalls in full-stack application development, specifically regarding state synchronization and data security.

* **Server State Management (TanStack Query):**
    * *The Problem:* Standard `useEffect` fetching often leads to race conditions and stale UI data.
    * *The Solution:* We adopted TanStack Query to treat server state as a first-class citizen. By leveraging **query keys** and **cache invalidation**, we ensure the dashboard remains atomically synced with the database. Mutations (e.g., adding an application) automatically trigger background revalidation, providing a seamless "live" UI experience without manual state management.
* **Performance & Data Filtering:**
    * *The Problem:* Client-side filtering of large datasets is inefficient and exposes unnecessary data.
    * *The Solution:* We implemented **server-side filtering** via Prisma ORM for critical path logic, such as "Upcoming Interviews." This ensures minimal network payloads and improves security by enforcing data isolation at the database level (`userId` checks).
* **Security Hardening:**
    * *The Approach:* Stateless JWT-based authentication combined with granular ownership checks inside the application controllers. Even if a user attempts to access an invalid `applicationId`, the backend enforces record ownership, returning a 403 Forbidden to maintain strict data isolation.

## Tech Stack
| Tier | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), TanStack Query, Tailwind CSS, Shadcn/UI |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Prisma |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs |

## API Contract (Core)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Rate Limited | User creation with secure password hashing. |
| `GET` | `/api/applications` | JWT Required | Fetches user-specific application data. |
| `POST` | `/api/applications` | JWT Required | Creates application linked to `req.user.id`. |
| `PATCH` | `/api/applications/:id` | Ownership Check | Validates record ownership before updates. |

## Local Setup
    ```bash
    # 1. Clone the repository
    git clone <repo-url> && cd job-tracker

    # 2. Install dependencies (Root, Frontend, & Backend)
    npm install

    # 3. Configure Environment
    # Copy .env.example to .env and define your DATABASE_URL and JWT_SECRET

    # 4. Initialize Database & Seed
    npx prisma migrate dev
    npm run seed

    # 5. Launch
    npm run dev

## License
This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.