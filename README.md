# FarmInsight - Frontend (Angular Web App)

This repository contains the frontend web application for the **FarmInsight** platform, developed as part of my Bachelor's Thesis. The application is built with Angular and is designed for farm managers.

## Overview

The FarmInsight web app provides a comprehensive dashboard and a suite of tools for the strategic and operational management of a farm. It allows managers to get a clear overview of all activities, plan for the future, and interact with data in a modern, user-friendly interface.

### Key Features
*   **Interactive Dashboard:** A central hub showing weather forecasts, drought alerts, and a summary of ongoing tasks.
*   **Field Management:** An interactive map (using Mapbox) where managers can draw, edit, and manage farm plots.
*   **Crop Management:** A detailed crop catalog and a system for tracking currently planted crops, their lifecycle, and history.
*   **Task Management:** A Kanban-style board for creating, assigning, monitoring, and commenting on tasks.
*   **AI Disease Identification:** An interface to upload plant images and receive AI-powered disease diagnostics from the backend.
*   **User Management:** Tools for adding and managing farm employees.
*   **Real-time Notifications:** A notification panel that updates in real-time with system events via SignalR.

### Technology Stack

*   **Angular v19** (with Standalone Components)
*   **TypeScript**
*   **RxJS** for reactive programming and state management.
*   **Angular Signals** for fine-grained reactivity.
*   **PrimeNG** Component Library for a rich set of UI components.
*   **SignalR Client** for real-time communication.

## Getting Started

### Prerequisites
*   Node.js (LTS version)
*   Angular CLI (`npm install -g @angular/cli`)

### Installation & Running
1.  **Clone the repository:**
    ```sh
    git clone https://github.com/ccaesar26/FarmWebUI
    cd FarmWebUI
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```
3.  **Configure API endpoint:**
    The application is configured to communicate with the backend API Gateway. Ensure the proxy configuration in `proxy.conf.json` points to the correct address where your backend is running.
4.  **Run the development server:**
    ```sh
    ng serve
    ```
    Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.
