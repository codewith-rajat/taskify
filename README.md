
# 📊 Taskify - Project Management Dashboard

A full-stack project management dashboard inspired by Jira, built with **React**, **Express.js**, and **PostgreSQL**. Manage projects, create tasks, assign team members, track progress with a Kanban board, and collaborate with nested comments.

---

## ✨ Features

### Core Features
- **User Authentication** - Register, login with JWT tokens, protected routes
- **Project Management** - Create, edit, delete projects with status tracking
- **Task/Issue Management** - Full CRUD operations with priorities and due dates
- **Kanban Board** - Drag-and-drop task management across 4 status columns (To Do, In Progress, In Review, Done)
- **Team Collaboration** - Assign tasks to team members and invite users via email
- **Comments & Discussions** - Add comments to tasks with infinite nesting (like Instagram) and @mention support
- **File Attachments** - Upload screenshots and files (up to 10MB) to tasks
- **Search & Filter** - Global search and project-based filtering
- **Role-Based Access Control** - Admin, Manager, and Developer roles with permission hierarchy
- **Dashboard Analytics** - View project statistics, task distribution charts, and upcoming deadlines

### Additional Features
- 🌙 **Dark Mode** - Full dark mode support throughout the application
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🎨 **Professional UI** - Jira-inspired clean and modern interface
- 📧 **Email Invitations** - Send team invitations with 7-day expiry tokens
- 📊 **Data Visualization** - Charts for task completion and project insights

---

## 🏗️ Tech Stack

### Frontend
- **React 19.2.4** - UI framework
- **Vite 8.0.8** - Build tool and dev server
- **Redux Toolkit 1.9.7** - State management
- **React Router 6.20.0** - Routing
- **Tailwind CSS 3.3.6** - Styling
- **Material-UI 5.14.11** - DataGrid and components
- **React DnD 16.0.1** - Drag-and-drop functionality
- **Recharts 2.10.3** - Data visualization
- **Lucide React 0.294.0** - Icons
- **Native Fetch API** - HTTP requests

### Backend
- **Node.js v16+** - Runtime
- **Express.js 4.18.2** - Web framework
- **PostgreSQL** - Database (via Supabase)
- **JWT 9.0.2** - Authentication
- **bcryptjs 2.4.3** - Password hashing
- **Multer 1.4.5** - File upload handling
- **Express Validator 7.0.0** - Input validation
- **CORS 2.8.5** - Cross-origin requests
- **Helmet 7.1.0** - Security headers

### Database
- **Supabase PostgreSQL** - Managed PostgreSQL with Session Pooler
- **Tables**: users, projects, tasks, comments, project_members, invitations, attachments, teams

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16 or higher
- npm or yarn
- PostgreSQL database (or Supabase account)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/codewith-rajat/taskify.git
cd taskify
```

2. **Setup Backend**
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
# Database
DB_HOST=your-supabase-host.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.your-project-id
DB_PASSWORD=your-password

# JWT
JWT_SECRET=your_jwt_secret_key

# Server
PORT=5000
FRONTEND_URL=http://localhost:5173

# Email (optional, for future notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

Initialize the database:
```bash
node src/init-db.js
```

Start the backend server:
```bash
npm start
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 📖 Usage

### Authentication
1. Register a new account or login with existing credentials
2. JWT token is automatically stored and sent with all authenticated requests
3. Sessions persist across page refreshes

### Project Management
1. Navigate to "Projects" to view all your projects
2. Create a new project with name, description, status, and dates
3. Invite team members via email invitations (valid for 7 days)
4. View project members and their roles

### Task Management
1. Open a project to see its tasks in Kanban view
2. Create tasks with title, description, priority, and due date
3. Assign tasks to team members
4. Update task status by dragging cards between columns
5. Edit or delete tasks as needed

### Collaboration
1. Click on any task to open details modal
2. Add comments (supports unlimited nesting like Instagram)
3. Use @mentions to tag team members (appears in blue)
4. Reply to comments at any nesting level
5. Upload attachments (screenshots, documents up to 10MB)
6. Download or delete attachments anytime

### Search & Filter
1. Use the search bar in navbar for global search across all tasks
2. Filter tasks by project on the Tasks page
3. Kanban board shows tasks grouped by status automatically

### Roles & Permissions
- **Admin** - Full access to all projects and administrative functions
- **Manager** - Can create projects, manage team members, edit tasks
- **Developer** - Can create and update tasks, comment, but limited to assigned tasks

---

## 📁 Project Structure

```
taskify/
├── frontend/
│   ├── src/
│   │   ├── components/      # React components (Sidebar, Navbar, etc.)
│   │   ├── pages/           # Page components (Dashboard, Projects, Tasks, etc.)
│   │   ├── services/        # API service layer (Fetch-based)
│   │   ├── store/           # Redux store and slices
│   │   ├── App.jsx          # Main app component with routing
│   │   └── index.css        # Global styles and Jira-inspired theme
│   ├── public/              # Static assets
│   ├── vite.config.js       # Vite configuration
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   │   ├── auth.js
│   │   │   ├── projects.js
│   │   │   ├── tasks.js
│   │   │   ├── comments.js
│   │   │   ├── projectMembers.js
│   │   │   ├── uploads.js
│   │   │   └── ...
│   │   ├── middleware/      # Express middleware
│   │   │   ├── auth.js      # JWT verification
│   │   │   └── rbac.js      # Role-based access control
│   │   ├── config/          # Configuration files
│   │   │   └── database.js  # PostgreSQL connection pool
│   │   ├── index.js         # Express server entry point
│   │   └── init-db.js       # Database schema initialization
│   ├── uploads/             # Uploaded files directory
│   ├── .env                 # Environment variables (not in git)
│   └── package.json
│
└── README.md                # This file
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks or filtered
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete task

### Comments
- `GET /api/comments/task/:taskId` - Get nested comments
- `POST /api/comments` - Add comment
- `DELETE /api/comments/:id` - Delete comment

### File Upload
- `POST /api/uploads/upload` - Upload file
- `GET /api/uploads/:id` - Download file
- `DELETE /api/uploads/:id` - Delete file

### Project Members
- `POST /api/project-members/invite` - Send invitation
- `POST /api/project-members/accept` - Accept invitation

---

## 🌐 Deployment

### Deploy Backend to Render
1. Push your code to GitHub
2. Go to [Render.com](https://render.com)
3. Create new Web Service, connect GitHub repository
4. Set environment variables from `.env` file
5. Deploy with command: `npm start`

### Deploy Frontend to Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set environment variable: `VITE_API_URL=<your-render-backend-url>/api`
4. Deploy (Vercel handles build automatically)

### Database Setup
- Use Supabase PostgreSQL with Session Pooler for production
- Run `node src/init-db.js` on backend after deployment to initialize schema
- Store credentials securely in environment variables

---

## 🛠️ Development

### Running Both Servers

Terminal 1 (Backend):
```bash
cd backend
npm start
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

Backend runs as-is with `npm start`

---

## 📝 Common Tasks

### Add New API Endpoint
1. Create route file in `backend/src/routes/`
2. Import in `backend/src/index.js` and use `app.use()`
3. Add corresponding API method in `frontend/src/services/api.js`

### Customize Theme
- Edit `frontend/src/index.css` for color scheme
- Edit `frontend/tailwind.config.js` for Tailwind configuration
- Material-UI theme in component files can be customized

### Modify Database Schema
1. Update schema in `backend/src/init-db.js`
2. Run `node src/init-db.js` to apply changes
3. Update API routes accordingly

---

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

**Codewith Rajat**

---

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ using React, Express, and PostgreSQL**
