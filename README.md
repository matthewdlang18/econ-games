# Economics Course Games

An interactive web application for economics students to play educational games, both individually and as a class, with rounds controlled by Teaching Assistants.

## Features

- Authentication using passcodes for students and TAs
- Role-based access (students vs. TAs)
- TA dashboard for controlling game rounds
- Student interface for participating in games
- Integration with Supabase for database and authentication

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Supabase account

### Supabase Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL script from `supabase/schema.sql` to create the necessary tables and policies
4. Get your Supabase URL and anon key from the API settings page

### Local Development

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with your Supabase credentials (copy from `.env.example`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
   ```

   **Important:** Never commit your `.env.local` file to version control. It contains sensitive credentials and is already in `.gitignore`.
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment to GitHub Pages

1. Create a GitHub repository for your project
2. Push your code to the repository
3. Set up GitHub Pages deployment:
   - Go to your repository settings
   - Navigate to the "Pages" section
   - Select the branch you want to deploy (usually `main`)
   - Set the folder to `/` (root)
   - Click "Save"

4. Alternatively, for better Next.js support, you can use Vercel for deployment:
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect Next.js and set up the deployment
   - Add your environment variables in the Vercel dashboard

## Usage

### For Students

1. Enter your assigned passcode on the login page
2. Access available games on the games page
3. Participate in active games as directed by your TA

### For Teaching Assistants

1. Enter your TA passcode on the login page
2. Access the TA dashboard
3. Start new games and control game rounds
4. View student participation and results

## Adding New Games

To add new games to the application:

1. Create a new game component in `src/app/games/[game-name]/page.tsx`
2. Add the game to the TA dashboard options
3. Implement the game logic and UI
4. Update the database schema if necessary

## License

[MIT](LICENSE)
