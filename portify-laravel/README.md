# Portify — Online Portfolio Template Generator

## Project Overview

Portify is a web-based application that allows users to create, customize, preview, and manage their personal portfolios. It uses Laravel for authentication and backend processing.

## Features

- User registration and login
- Secure logout
- Create and edit portfolio information
- Choose from three portfolio templates: Simple, Modern, and Creative
- Preview portfolio designs
- View and manage saved portfolios
- Delete portfolio records
- Store portfolio data in a database
- Responsive user interface

## Technologies Used

- HTML
- CSS
- JavaScript
- PHP
- Laravel
- MySQL or another Laravel-supported database

## Installation and Setup

1. Clone or download this repository.
2. Open the project folder in your terminal.
3. Install dependencies:

   ```bash
   composer install
   ```

4. Configure your `.env` file with your database credentials.
5. Generate an application key if needed:

   ```bash
   php artisan key:generate
   ```

6. Run database migrations:

   ```bash
   php artisan migrate
   ```

7. Start the Laravel development server:

   ```bash
   php artisan serve --host=0.0.0.0 --port=8000
   ```

8. Open the forwarded port URL in your browser.

## How to Use

1. Register a new account or log in.
2. Enter your personal and professional information.
3. Click **Save & Choose Template**.
4. Select your preferred portfolio design.
5. Preview your portfolio.
6. Manage your saved portfolio information.

## Project Structure

- `app/` — Models and controllers
- `database/migrations/` — Database table definitions
- `public/portify/` — Portfolio interface, styles, and JavaScript
- `resources/views/` — Laravel Blade templates
- `routes/web.php` — Application routes
- `.env.example` — Example environment configuration
- `README.md` — Project documentation

## Security

The application uses Laravel authentication, request validation, and CSRF protection. Database credentials and other secrets should remain in the private `.env` file.

## Purpose

Portify provides a convenient way for students and other users to create and manage a personal portfolio through a simple web interface.

## License

This project was developed for educational purposes.

