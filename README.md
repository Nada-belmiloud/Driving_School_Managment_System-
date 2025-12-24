## 📌 Overview
The Driving School Management System is a **web and desktop application** designed to manage a driving school through a **centralized admin-only platform**.

- The **web version** is built using **Next.js** and is accessed exclusively by the administrator.
- The **desktop version** is built with **Electron**, providing a standalone desktop application for administrative use.

The system is **used only by the administrator**, who has full control over managing candidates, instructors, vehicles, schedules, exams, and payments.

## 🎯 Project Objectives
- Digitalize driving school management processes  
- Centralize data for students, instructors, and courses  
- Improve scheduling and progress tracking  
- Apply software engineering best practices 

## ⚙️ Main Features

### 🔐 Admin Access
- Secure admin authentication using email and password
- Single-role system (administrator only)

### 👨‍🎓 Candidate Management
- Add, edit, and delete candidate profiles
- Track candidate progress

### 👨‍🏫 Instructor Management
- Add, edit, and delete instructor profiles
- Assign instructors to schedules and exams

### 🚗 Vehicle Management
- Add, edit, and delete vehicles  
- Assign vehicles to courses and exams  
- Track vehicle maintenance (maintenance history, status, and availability)

### 📅 Schedule Management
- Create and manage lesson schedules
- Assign candidates, instructors, and vehicles

### 📝 Exam Management
- Schedule driving and theoretical exams
- Track exam results

### 💳 Payment Management
- Manage payments and payment history

### 🖥️ Desktop Application
- Standalone desktop application using Electron
- Native window controls

### 🔒 Security
- Password hashing using bcrypt
- JWT-based authentication for secure admin sessions

## 🛠️ Tech Stack

| Layer | Technology |
|------|-----------|
| Frontend | Next.js, React, TailwindCSS |
| Backend | Node.js, Express |
| Database | MongoDB (MongoDB Atlas) |
| Desktop | Electron |
| Authentication | JWT, bcrypt |
| UI Components | Radix UI, Recharts |
| Version Control | Git & GitHub |

## 🧩 System Architecture
The system follows a **client–server architecture** designed for **single-admin usage**:
- Admin interface built with Next.js + TailwindCSS
- Backend API built with Node.js + Express  
- MongoDB for data storage  
- Electron for desktop deployment  

Architecture and UML diagrams are included in the documentation.
