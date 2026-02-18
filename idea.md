# MockMate AI – Interview Simulation Platform

## Project Title
**MockMate AI** – A robust backend-driven interview simulation platform designed to help students and job seekers practice their technical and behavioral interviews through rule-based evaluation.

## Problem Statement
Many students and entry-level professionals struggle with interview anxiety and lack access to immediate, objective feedback. While human-led mock interviews are effective, they are often expensive, difficult to schedule, and inconsistent. There is a need for a scalable, always-available tool that can evaluate user responses against key technical criteria without the complexity of heavy machine learning models.

## Proposed Solution
MockMate AI provides an automated environment where users can choose interview categories and answer questions. The system utilizes a rule-based keyword scoring engine to evaluate responses. By matching user input against a predefined list of essential keywords and concepts for each question, the platform generates an objective score and feedback report instantly.

## Scope of the Project
The project focuses on building a scalable backend architecture that handles user sessions, question management, and real-time scoring. It covers user registration/login, interview orchestration (sequencing questions), and detailed report generation. Frontend implementation is considered out of scope for this backend-heavy system design.

## Key Features

### User Features
- **Registration & Authentication:** Secure JWT-based signup and login.
- **Start Interview:** Select domains (e.g., Java, System Design) and start a timed session.
- **Submit Answer:** Recording textual responses for specific questions.
- **Submit Interview:** Finalize the session and trigger the evaluation engine.
- **View Results:** Access a detailed Score Report with a breakdown of matched keywords.
- **Interview History:** Track progress over time through past simulation records.

### Admin Features
- **Question Management:** CRUD operations for the interview question bank.
- **User Management:** Oversee registered users and their session activities.
- **Report Analytics:** View aggregated interview reports to identify common knowledge gaps.

## AI Evaluation Engine (Rule-Based Keyword Matching)
Instead of complex ML models, the engine uses a **Deterministic Keyword Scoring Algorithm**:
1. **Keyword Pre-processing:** Each question in the database is associated with a list of "Required Keywords" and "Bonus Keywords" with associated weights.
2. **Matching Logic:** The engine performs case-insensitive word-frequency analysis and fuzzy matching on the user’s submitted answer.
3. **Weight Calculation:** Scores are aggregated based on the presence of keywords. Mandatory keywords carry higher weight, while missing keywords deduct from the potential total.
4. **Feedback Generation:** The system identifies which key concepts were missed and suggests them in the final report.

## Backend Architecture Overview (Controller → Service → Repository)
The system follows a strict layered architecture to ensure separation of concerns:
- **Controller Layer:** Handles HTTP requests, validates input, and delegates to services.
- **Service Layer:** Contains the core business logic, including the interview orchestration and keyword matching algorithm.
- **Repository Layer:** Interface for PostgreSQL database operations using an ORM or Query Builder, abstracting the data storage details from the logic.

## OOP Principles Applied
- **Encapsulation:** Protecting user data and session states within classes with controlled accessors.
- **Abstraction:** Using interfaces/abstract classes for the scoring engine to allow for different scoring rules.
- **Inheritance:** Defined base User/Role classes to manage Admin and Regular User permissions.
- **Single Responsibility:** Each class (e.g., `EvaluationService`, `QuestionRepository`) has one clear purpose.

## Design Patterns Used
- **Strategy Pattern:** Implemented for the Scoring Engine. This allows switching between different keyword matching strategies (e.g., Strict Matching vs. Fuzzy Matching) without changing the core service logic.
- **Middleware Pattern:** Applied to the Express.js pipeline for JWT authentication and role-based access control (RBAC).
- **Repository Pattern:** To decouple business logic from the PostgreSQL data access layer, easing testing and maintenance.

## Database Overview
The system uses **PostgreSQL** to store relational data, ensuring ACID compliance:
- **Relational Integrity:** Linking answers to specific interview sessions and sessions to users.
- **Normalization:** Efficient storage of questions, roles, and historical reports.

## Why This Project is Valuable
- **Immediate Feedback:** Users get instant results, allowing for faster learning cycles.
- **Scalability:** The keyword-based approach is computationally lightweight compared to LLM-based solutions.
- **System Design Focus:** Demonstrates professional backend practices, layered architecture, and design pattern implementation suitable for a long-term production system.

## Future Enhancements
- **Natural Language Processing (NLP):** Integrating basic NLP for better semantic matching (Synonym detection).
- **Voice-to-Text Integration:** Allowing users to speak their answers using STT APIs.
- **Peer Comparison:** benchmarking scores against other users in the same category.
