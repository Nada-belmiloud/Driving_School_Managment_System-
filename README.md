# Driving School Management System

## Overview
The Driving School Management System is a **web and desktop application** designed to manage a driving school efficiently.  
- The **web version** is built with **Next.js** and can be accessed via browser.  
- The **desktop version** is built with **Electron**, wrapping the web app into a standalone desktop application for native use.  

It allows administrators to manage students, instructors, courses, and schedules in one centralized system.

---

## Features

- **User Management**
  - Admin login with email & password
  - Role-based access (manager, instructor, staff)
- **Student Management**
  - Add, edit, delete student profiles
  - Track course progress
- **Instructor Management**
  - Add, edit, delete instructor profiles
  - Assign instructors to courses
- **Course & Schedule Management**
  - Create, edit, and delete courses
  - Assign students and instructors to schedules
- **Desktop Enhancements**
  - Standalone desktop application via Electron
  - Native window controls
- **Security**
  - Passwords hashed with bcrypt
  - JWT authentication for secure sessions

---

## Tech Stack

| Layer         | Technology               |
|---------------|-------------------------|
| Frontend      | React + Next.js + TailwindCSS |
| Backend       | Node.js + Express       |
| Database      | MongoDB Atlas           |
| Desktop       | Electron                |
| Authentication| JWT + bcrypt            |
| UI Components | Radix UI, Recharts      |

---

## Installation & Setup

1. **Clone the repository:**
```bash
git clone "https://github.com/Nada-belmiloud/Driving_School_Managment_System-"
cd Driving_School_Management_System/project
