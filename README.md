NotesEverywhere!



Project Leader: Josh Harvey C. Bandigas


Team Members:

Vince Ryan Arceo

Kian Carcueva

Mon Jacob Tamparong

Dan Claude Bonifacio

Live Application
Vercel Deployment: [Your Vercel Deployment Link Here]

Source Code
GitHub Repository: [Your GitHub Repository Link Here]

Project Overview
A full-featured web application for creating and managing personal notes with secure authentication, CRUD operations, and media upload capabilities.

Features Implemented
User Authentication - Sign up and login using Supabase Auth

CRUD Operations - Create, Read, Update, Delete notes

Media Upload - Upload images and videos (max 5 files, 5MB each)

Responsive Design - Works on mobile and desktop

Real-time Updates - Instant feedback on all actions

Setup Instructions
1. Local Development Setup
Clone the repository

Open the project folder in VS Code

Install Live Server extension

Right-click index.html → "Open with Live Server"

App runs at http://localhost:5500

2. Supabase Configuration
Create free account at supabase.com

Create new project

Run SQL setup in SQL Editor

Create storage bucket named notes-media

Configure authentication settings

Update credentials in supabase-config.js

3. Database Setup (Run in Supabase SQL Editor)
sql
CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT,
  media_urls JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notes" 
ON notes FOR ALL USING (auth.uid() = user_id);
4. Deployment
Push code to GitHub repository

Connect repository to Vercel

Deploy as static site

Update Vercel link in README

Project Structure
text
notes-app/
├── index.html          # Main application
├── style.css           # Custom styles
├── app.js              # Main logic
├── auth.js             # Authentication
├── notes.js            # Notes CRUD
├── storage.js          # File upload
├── supabase-config.js  # Supabase config
└── README.md           # Documentation
How to Use
Sign up with email and password

Create new notes with text

Upload images/videos to notes

Edit or delete existing notes

Logout when finished
Installation Instructions
1. Local Development Setup
Prerequisites
VS Code (or any code editor)

Live Server extension for VS Code

Modern web browser (Chrome, Firefox, Edge)

Step-by-Step Setup
A. Download Project Files
Clone the repository:

bash
git clone [your-github-repository-link]
Or download as ZIP and extract

Open project folder in VS Code:

bash
cd notes-app-supabase
code .
B. Install VS Code Extensions
Open VS Code Extensions (Ctrl+Shift+X)

Search and install:

Live Server by Ritwick Dey

Prettier - Code formatter (optional)

C. Configure Supabase
Sign up at supabase.com

Create new project:

Click "New project"

Project name: notes-app

Database password: [create secure password]

Region: [choose closest]

Click "Create new project"

Get credentials:

Go to Settings → API

Copy:

Project URL

anon public key

Configure the application:
Edit supabase-config.js:

javascript
const supabaseUrl = 'https://your-project-id.supabase.co';
const supabaseKey = 'your-anon-public-key';
D. Set Up Database
In Supabase dashboard, go to SQL Editor

Run this SQL:

sql
-- Create notes table
CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT,
  media_urls JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
CREATE POLICY "Users can manage own notes" 
ON notes 
FOR ALL 
USING (auth.uid() = user_id);
Set up storage:

Go to Storage → Create bucket

Name: notes-media

Set to Public

Click Create bucket

E. Configure Authentication
Go to Authentication → Providers

Under Email:

Ensure it's enabled

Turn OFF "Confirm email" for testing

Go to Authentication → URL Configuration

Set Site URL to: http://localhost:5500

F. Run the Application
In VS Code, right-click index.html

Select "Open with Live Server"

Application opens at http://localhost:5500

2. Testing the Setup
Test Authentication
Open http://localhost:5500

Click "Sign Up"

Enter:

Name: Test User

Email: test@example.com

Password: password123 (min 6 characters)

Click "Sign Up"

You should be automatically logged in

Test Note Creation
Fill in:

Title: "Test Note"

Content: "This is a test note"

Click "Save Note"

Note should appear in "My Notes" section

Test File Upload
Create new note

Click "Choose Files"

Select an image (jpg, png) or video (mp4)

File should preview below

Click "Save Note"

Media should display in the note

3. Troubleshooting
Common Issues & Solutions
Issue: "Supabase not initialized" error
Solution:

Check supabase-config.js has correct URL and key

Verify internet connection

Check browser console (F12) for errors

Issue: Can't sign up
Solution:

Check if email already exists

Try a new email address

Make password at least 6 characters

Disable email confirmation in Supabase settings

Issue: File upload fails
Solution:

Check file size (max 5MB)

Check file type (images: jpg, png, gif; videos: mp4)

Verify storage bucket exists and is public

Issue: Notes not saving
Solution:

Check if user is logged in

Verify database table exists

Check browser console for SQL errors

Issue: App not loading
Solution:

Clear browser cache (Ctrl+Shift+Delete)

Try different browser

Check if Live Server is running

4. Deployment to Vercel
Prerequisites
GitHub account

Vercel account (free)

Deployment Steps
Push to GitHub:

bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
Deploy on Vercel:

Go to vercel.com

Sign in with GitHub

Click "New Project"

Import your repository

Click "Deploy"

Update Supabase URLs:

In Supabase dashboard

Go to Authentication → URL Configuration

Update Site URL to your Vercel URL

Add Redirect URLs

5. Final Verification
Checklist
✅ All 8 project files uploaded
✅ Supabase credentials configured
✅ Database tables created
✅ Storage bucket set up
✅ Authentication configured
✅ Local server running at localhost:5500
✅ Can sign up and login
✅ Can create notes
✅ Can upload files
✅ Can edit/delete notes

Testing Script
javascript
// Open browser console and run:
console.log('Testing Notes App Setup:');

// Check Supabase connection
if (typeof supabase !== 'undefined') {
  console.log('✅ Supabase connected');
} else {
  console.log('❌ Supabase not connected');
}

// Check current user
supabase.auth.getUser().then(({ data: { user } }) => {
  if (user) {
    console.log('✅ User logged in:', user.email);
  } else {
    console.log('❌ No user logged in');
  }
});
Need Help?
Check browser console (F12) for errors

Verify Supabase project is active

Check file permissions and paths

Contact group leader for assistance


Submitted for: Web Development Course
Date: December 2024
Group Leader: Josh Harvey C. Bandigas
