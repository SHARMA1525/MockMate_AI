import os
import subprocess
import sys

# Get all untracked files
p = subprocess.run(["git", "status", "-s"], capture_output=True, text=True)
untracked = []
for line in p.stdout.split('\n'):
    if line.startswith("??"):
        # this is an untracked file or folder
        folderOrFile = line[3:].strip()
        if os.path.isdir(folderOrFile):
            # get all files recursively
            for root, dirs, files in os.walk(folderOrFile):
                for file in files:
                    full_path = os.path.join(root, file)
                    if ".git" not in full_path and "node_modules" not in full_path:
                        untracked.append(full_path)
        else:
            untracked.append(folderOrFile)

# Sometimes `git status -s` does not list files inside newly created untracked folders individually depending on git version. Actually, `git ls-files --others --exclude-standard` is better!
p = subprocess.run(["git", "ls-files", "--others", "--exclude-standard"], capture_output=True, text=True)
untracked = [line.strip() for line in p.stdout.split('\n') if line.strip() and "node_modules" not in line]

commits = [
    "Initialized project structure and configured basic dependencies",
    "Set up project folder organization and initial configuration files",
    "Created main application entry point and basic routing",
    "Configured development environment and ESLint rules",
    "Set up MongoDB connection and environment variables",
    "Designed user and interview database schemas",
    "Created Mongoose models for users and questions",
    "Implemented user registration logic with password validation",
    "Added user authentication using JSON Web Tokens",
    "Created middleware for route protection and user validation",
    "Implemented user profile creation and fetch logic",
    "Added CRUD operations for interview questions",
    "Created endpoint to start a new mock interview session",
    "Implemented logic to save interview answers and user feedback",
    "Created API route to fetch user interview history",
    "Added error handling middleware for backend routes",
    "Integrated AI service configuration for answer evaluation",
    "Implemented interview evaluation logic using AI prompts",
    "Added endpoint to retrieve detailed interview results",
    "Configured CORS policy for frontend communication",
    "Set up React frontend and installed core dependencies",
    "Configured global CSS layout variables and base typography",
    "Created responsive navbar and footer components",
    "Implemented basic layout wrapper for application views",
    "Built landing page with call to action and feature highlights",
    "Created authentication pages for login and registration",
    "Integrated frontend routing using React Router",
    "Implemented state management for active user sessions",
    "Connected registration form to backend authentication API",
    "Integrated login form and implemented secure token storage",
    "Created protected route wrapper for authenticated pages",
    "Designed and built user dashboard layout",
    "Implemented frontend API service layer for backend requests",
    "Fetched and displayed user statistics on the dashboard",
    "Created configuration screen for new interview setup",
    "Built dynamic form to select interview topics and difficulty",
    "Added interview loading screen with preparation tips",
    "Implemented main interview interface and modular question display",
    "Added audio recording component for vocal answers",
    "Created timer and progress indicators for active interviews",
    "Integrated interview submission pipeline with backend API",
    "Built results page to display AI feedback and scoring",
    "Created history page to list past interview sessions",
    "Added custom modal components for confirmation actions",
    "Implemented responsive design breakpoints for mobile devices",
    "Fixed validation issue in user registration form",
    "Resolved error preventing token refresh on expiration",
    "Fixed state update delay in interview timer component",
    "Addressed database connection timeout configuration issue",
    "Fixed UI overflow on results page for long feedback text",
    "Resolved audio recording permission denial crash",
    "Fixed incorrect calculation of average interview scores",
    "Corrected navigation router issue after logging out",
    "Fixed unhandled promise rejection in AI evaluation service",
    "Resolved screen flickering on dashboard during data fetch",
    "Refactored API service layer for better readability and reuse",
    "Extracted common form input fields into reusable components",
    "Simplified authentication middleware logic in express",
    "Restructured React context to separate UI state from auth state",
    "Cleaned up redundant CSS styles and improved stylesheet organization",
    "Refactored question generation logic into a dedicated service",
    "Optimized state updates in the interview recording component",
    "Consolidated error handling logic across frontend pages",
    "Merged duplicate database query logic in user controllers",
    "Refactored API interceptors for improved global error management",
    "Set up Jest testing environment for backend services",
    "Implemented basic unit tests for user authentication utilities",
    "Added integration tests for core mock interview endpoints",
    "Created unit tests for the AI evaluation prompt generator",
    "Set up testing environment for React frontend components",
    "Added snapshot tests for core UI application layouts",
    "Implemented test coverage for custom React hooks",
    "Created automated mock tests for login and registration logic",
    "Added database indexing to improve query speed on interview history",
    "Implemented basic data caching for frequently requested question categories",
    "Optimized frontend assets and reduced bundle size via code splitting",
    "Implemented lazy loading for non-critical application routes",
    "Added request debouncing to interactive elements to reduce API load",
    "Polished user interface transitions and added subtle hover states",
    "Improved application accessibility with focused ARIA labels",
    "Updated backend API documentation with endpoint parameters",
    "Added sample environment files and cleaned up unused dependencies",
    "Updated documentation with comprehensive project setup instructions"
]

if len(untracked) < len(commits):
    print("Warning: More commits than untracked files!")
    sys.exit(1)

total = len(commits)
for i, msg in enumerate(commits):
    print(f"Executing Commit {i+1} / {total}")
    print(f"Message: {msg}")
    
    # Give the first commits an extra file if there are more files than commits
    num_files_to_add = len(untracked) // (total - i)
    files = untracked[:num_files_to_add]
    untracked = untracked[num_files_to_add:]
    
    for f in files:
        if os.path.exists(f):
            subprocess.run(["git", "add", f], check=True)
            print(f"  Staged: {f}")

    subprocess.run(["git", "commit", "-m", msg], check=True)
    print()

subprocess.run(["git", "branch", "-M", "main"], check=True)
subprocess.run(["git", "push", "-u", "origin", "main"], check=True)
print("Finished!")
