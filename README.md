# Dr MCQ

**Live demo:** drmcq.netlify.app

## What it does
Dr MCQ is an AI-powered clinical question generator designed to help medical students transform their study notes into high-quality practice exams. By leveraging advanced language models, the platform instantly converts clinical text, markdown, or documents into structured MCQs, complete with reasoning, hints, and interactive tutoring.

## Tech stack
- **Frontend:** HTML5, Vanilla JavaScript, CSS3 (Custom Glassmorphism Design)
- **AI Engines:** Google Gemini 1.5 Flash & Groq (Llama-3.3-70b-versatile)
- **Backend:** Netlify Functions (Serverless architecture for secure API proxying)
- **Design:** Google Fonts (Syne, Lora, DM Mono) with automatic Dark/Light mode support

## Key features
- **Smart MCQ Generation:** Instantly generates 5 structured clinical MCQs from pasted text or uploaded files (.txt, .md, .docx).
- **Interactive Quiz Experience:** A premium, card-based interface with keyboard shortcuts (1-4, Space, Arrow keys) and real-time progress tracking.
- **Visual Performance Analytics:** Unique body-region heatmap and calendar streak visualization to identify weak areas and maintain study consistency.
- **AI Clinical Tutor:** Integrated chat interface to dive deeper into complex medical reasoning and clarify difficult concepts.
- **Privacy & Portability:** All data is stored locally in the browser with full export/import capabilities for session history.

## Getting started
To run this project locally with full AI functionality:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Nofalzia/Medical-MCQ-generator.git
   ```
2. **Install Netlify CLI:**
   ```bash
   npm install netlify-cli -g
   ```
3. **Configure Environment Variables:**
   Ensure you have a `.env` file or Netlify environment variables set for `GEMINI_API_KEY` and `GROQ_API_KEY`.
4. **Run via Netlify Dev:**
   ```bash
   netlify dev
   ```
*Alternatively, you can open `index.html` directly in your browser to view the UI, though AI generation requires the Netlify proxy.*

## Why I built this
I created Dr MCQ because my friends pursuing medical degrees were struggling with the complexity and token management of general AI tools for simple MCQ generation, which was slowing down their study flow. This project "kills two birds with one stone": it provides a highly useful, streamlined tool for medical students while showcasing my ability as a frontend developer to integrate advanced AI APIs into a polished, premium user experience.
