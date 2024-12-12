Custom Mail Server

Overview

This project implements a custom mail server using Node.js and MongoDB. The server supports sending and receiving emails using SMTP and IMAP protocols, along with user authentication, secure communication, and a REST API for interaction.

Setup Guide

Prerequisites

Node.js (v14 or later)

MongoDB (local or MongoDB Atlas)

An SMTP/IMAP email service provider (e.g., Gmail, Outlook)

Installation

Clone the repository:

git clone <repository-url>
cd custom-mail-server

Install dependencies:

npm install

Set up the .env file:
Create a .env file in the root directory and add the following:

PORT=5000
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
IMAP_USER=your_imap_username
IMAP_PASS=your_imap_password
JWT_SECRET=your_jwt_secret

Start the server:

node app.js

The server will run on http://localhost:5000 by default.

API Documentation

Endpoints

1. Register a User

Endpoint: POST /register

Description: Registers a new user with a username and password.

Request Body:

{
  "username": "exampleUser",
  "password": "examplePassword"
}

Response:

Success: 201 Created

{ "message": "User registered successfully" }

Error: 400 Bad Request

2. Login

Endpoint: POST /login

Description: Authenticates a user and returns a JWT token.

Request Body:

{
  "username": "exampleUser",
  "password": "examplePassword"
}

Response:

Success: 200 OK

{ "token": "<jwt-token>" }

Error: 403 Forbidden

3. Send Email

Endpoint: POST /send

Description: Sends an email using SMTP.

Headers:

Authorization: Bearer <jwt-token>

Request Body:

{
  "from": "sender@example.com",
  "to": "receiver@example.com",
  "subject": "Test Email",
  "text": "This is a test email."
}

Response:

Success: 200 OK

{ "message": "Email sent successfully" }

Error: 500 Internal Server Error

4. Retrieve Emails

Endpoint: GET /emails

Description: Fetches received emails via IMAP.

Headers:

Authorization: Bearer <jwt-token>

Response:

Success: 200 OK

{ "messages": [ { "subject": "Hello", "from": "test@example.com" } ] }

Error: 500 Internal Server Error

Design Choices

Technologies Used

Node.js: Chosen for its asynchronous capabilities and rich ecosystem.

MongoDB: Used to securely store user credentials.

Nodemailer: Simplifies email sending over SMTP.

imap-simple: Facilitates receiving emails using IMAP.

bcrypt: Provides secure password hashing.

jsonwebtoken: Implements token-based authentication.

Security Measures

Password Encryption:

User passwords are hashed using bcrypt before being stored in the database.

Token Authentication:

Each request to protected routes requires a valid JWT.

Secure Communication:

Emails are transmitted securely using STARTTLS or SSL/TLS protocols.

Environment Variables:

Sensitive credentials are stored in a .env file and not hardcoded.

Deliverables

Source Code

GitHub Repository: Link to Repository

Test Accounts

Account 1:

Username: testuser1

Password: password1

Account 2:

Username: testuser2

Password: password2

README File

Includes setup instructions, API documentation, and implementation details.
