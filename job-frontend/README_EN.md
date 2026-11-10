# Job Frontend

Modern job matching platform frontend built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Authentication**: Secure login/register with JWT tokens
- **Role-based Dashboards**: Different interfaces for candidates, employers, and admins
- **Real-time Chat**: Socket.IO integration for instant messaging
- **File Upload**: Drag-and-drop CV upload with progress tracking
- **State Management**: Zustand for global state management
- **Type Safety**: Full TypeScript implementation
- **Form Validation**: React Hook Form with Zod validation
- **API Integration**: React Query for data fetching and caching
- **Responsive Design**: Mobile-first approach

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Zustand** - State management
- **React Query** - Data fetching and caching
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Dropzone** - File upload component
- **Lucide React** - Icon library

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

## Installation

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd job-frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Copy environment file**
```bash
cp .env.local.example .env.local
```

4. **Configure environment variables**
Edit `.env.local` with your settings (see Configuration section)

### Docker Setup

1. **Build Docker image**
```bash
docker build -t job-frontend .
```

2. **Run container**
```bash
docker run -p 3000:3000 --env-file .env.local job-frontend
```

## Configuration

Environment variables in `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Enable analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

## Running the Application

### Development Mode

```bash
# Start development server with hot reload
npm run dev

# Or with yarn
yarn dev
```

The application will be available at http://localhost:3000

### Production Mode

```bash
# Build for production
npm run build

# Start production server
npm start

# Or with yarn
yarn build
yarn start
```

### Docker Compose

```bash
# From project root
docker-compose up frontend
```

## Project Structure

```
job-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/           # Authentication routes group
│   │   │   ├── login/        # Login page
│   │   │   └── register/     # Registration page
│   │   ├── dashboard/         # Dashboard routes group
│   │   │   ├── page.tsx      # Dashboard home
│   │   │   ├── profile/      # Profile settings
│   │   │   ├── cv/           # CV upload/management
│   │   │   ├── jobs/         # Job management (employers)
│   │   │   ├── messages/     # Chat interface
│   │   │   └── users/        # User management (admins)
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx         # Homepage
│   ├── components/             # Reusable components
│   │   ├── ui/              # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── providers.tsx     # React Query provider
│   │   └── ...
│   ├── lib/                  # Utility functions
│   │   ├── utils.ts         # Helper functions
│   │   └── api.ts          # API configuration
│   ├── store/                # State management
│   │   └── authStore.ts    # Authentication store
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts        # Global types
│   └── middleware.ts         # Next.js middleware
├── public/                  # Static assets
├── .env.local.example        # Environment variables template
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── README.md              # This file
```

## Pages and Features

### Authentication Pages

#### Login (`/auth/login`)
- Email and password authentication
- Remember me functionality
- Password visibility toggle
- Form validation and error handling
- Redirect to dashboard after login

#### Register (`/auth/register`)
- Multi-step registration form
- Role selection (candidate/employer)
- Password strength validation
- Email confirmation simulation
- Form validation with real-time feedback

### Dashboard Pages

#### Dashboard Home (`/dashboard`)
- Role-based welcome message
- Statistics cards with icons
- Recent activity timeline
- Quick actions navigation
- Responsive grid layout

#### Profile Settings (`/dashboard/profile`)
- Editable user information
- Form validation and auto-save
- Profile picture upload
- Contact information management
- Bio and location settings

#### CV Management (`/dashboard/cv`)
- Drag-and-drop file upload
- File type and size validation
- Upload progress indicator
- CV data display after parsing
- Delete and re-upload functionality

#### Job Management (`/dashboard/jobs`) - Employers Only
- Create new job postings
- Edit existing jobs
- View applications per job
- Job status management
- Application statistics

#### Messages (`/dashboard/messages`)
- Real-time chat interface
- Conversation list with search
- Message input with send button
- Typing indicators
- Message history with timestamps

#### User Management (`/dashboard/users`) - Admins Only
- User list with filtering
- Role-based permissions
- User status management
- Account verification
- User deletion

## Components

### UI Components (`src/components/ui/`)

#### Button Component
```tsx
import { Button } from '@/components/ui/button';

// Usage examples
<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>

<Button variant="outline" size="sm" loading={isLoading}>
  Loading...
</Button>
```

#### Input Component
```tsx
import { Input } from '@/components/ui/input';

<Input
  type="email"
  placeholder="Enter your email"
  error={error}
  onChange={handleChange}
/>
```

### Authentication Components

#### LoginForm
```tsx
import { LoginForm } from '@/components/auth/LoginForm';

<LoginForm
  onSubmit={handleLogin}
  loading={isLoading}
  error={loginError}
/>
```

#### RegisterForm
```tsx
import { RegisterForm } from '@/components/auth/RegisterForm';

<RegisterForm
  onSubmit={handleRegister}
  loading={isLoading}
  error={registerError}
/>
```

### Layout Components

#### DashboardLayout
```tsx
import DashboardLayout from '@/app/dashboard/layout';

// Automatically wraps all dashboard routes
// Provides sidebar navigation and user menu
```

## State Management

### Authentication Store (`src/store/authStore.ts`)

```typescript
import { useAuthStore } from '@/store/authStore';

// In components
const { user, login, logout, loading } = useAuthStore();

// Login
await login(email, password);

// Logout
logout();

// Access user data
console.log(user?.name);
```

### Store Structure
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
```

## API Integration

### React Query Configuration

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['jobs'],
  queryFn: fetchJobs
});

// Mutate data
const mutation = useMutation({
  mutationFn: createJob,
  onSuccess: () => {
    // Handle success
  }
});
```

### API Client (`src/lib/api.ts`)

```typescript
import api from '@/lib/api';

// GET request
const response = await api.get('/jobs');
const jobs = response.data;

// POST request
const newJob = await api.post('/jobs', jobData);

// PUT request
const updatedJob = await api.put(`/jobs/${id}`, jobData);

// DELETE request
await api.delete(`/jobs/${id}`);
```

## Real-time Features

### Socket.IO Integration

```typescript
import { io } from 'socket.io-client';

// Initialize socket
const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
  auth: {
    token: authToken
  }
});

// Join chat room
socket.emit('joinRoom', { roomId });

// Send message
socket.emit('sendMessage', {
  roomId,
  content: message
});

// Listen for messages
socket.on('newMessage', (message) => {
  // Update UI with new message
});
```

## File Upload

### React Dropzone Integration

```typescript
import { useDropzone } from 'react-dropzone';

const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop: handleFileUpload,
  accept: {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png']
  },
  maxSize: 10 * 1024 * 1024, // 10MB
  multiple: false
});
```

## Styling

### Tailwind CSS Configuration

The project uses Tailwind CSS with custom configuration:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          // ... more shades
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      }
    }
  },
  plugins: [require('@tailwindcss/typography')],
}
```

### CSS Variables

The app uses CSS variables for theming:

```css
/* src/app/globals.css */
:root {
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  /* ... more variables */
}

.dark {
  --primary-50: #1e3a8a;
  --primary-500: #3b82f6;
  --primary-600: #60a5fa;
  /* ... dark mode variables */
}
```

## Form Validation

### React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Use in component
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema)
});

// Submit handler
const onSubmit = (data) => {
  console.log(data); // { email: 'user@example.com', password: 'password' }
};
```

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- LoginForm.test.tsx
```

### E2E Tests

```bash
# Install Playwright
npm install -D @playwright/test

# Run E2E tests
npm run test:e2e

# Run tests in headed mode
npm run test:e2e:headed
```

## Deployment

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

### Environment Setup

1. **Production Environment Variables**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_AI_SERVICE_URL=https://ai.yourdomain.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

2. **Static Export (Optional)**
```bash
# Export as static site
npm run build
npm run export

# Deploy to static hosting
```

### Docker Deployment

```bash
# Build production image
docker build -t job-frontend:prod .

# Run with production settings
docker run -d \
  --name job-frontend-prod \
  -p 3000:3000 \
  --env-file .env.production \
  job-frontend:prod
```

### Cloud Deployment

#### Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel --prod
```

3. **Configure Environment Variables**
```bash
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_AI_SERVICE_URL
```

#### Netlify

1. **Build Configuration**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
```

2. **Deploy**
```bash
npm run build
# Upload .next directory to Netlify
```

#### AWS S3 + CloudFront

1. **Build and upload**
```bash
npm run build
aws s3 sync .next s3://your-bucket --delete
```

2. **Configure CloudFront**
- Set origin to S3 bucket
- Configure caching rules
- Set up custom domain

## Performance Optimization

### Code Splitting

The app uses automatic code splitting:

```typescript
// Dynamic imports for large components
const ChatComponent = dynamic(() => import('@/components/Chat'), {
  loading: () => <div>Loading...</div>,
  ssr: false
});
```

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/profile.jpg"
  alt="Profile"
  width={100}
  height={100}
  priority={true}
  placeholder="blur"
/>
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run analyze

# Check next.config.js for optimizations
```

## Troubleshooting

### Common Issues

1. **Build Fails - TypeScript Errors**
   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit
   
   # Update types
   npm install --save-dev @types/node
   ```

2. **Tailwind Classes Not Working**
   ```bash
   # Check Tailwind configuration
   npx tailwindcss --help
   
   # Rebuild CSS
   npm run build
   ```

3. **API Requests Failing**
   ```bash
   # Check environment variables
   echo $NEXT_PUBLIC_API_URL
   
   # Test API connectivity
   curl $NEXT_PUBLIC_API_URL/api/health
   ```

4. **Socket.IO Connection Issues**
   ```bash
   # Check CORS settings
   echo $NEXT_PUBLIC_API_URL
   
   # Verify WebSocket support
   wscat -c ws://localhost:3001
   ```

### Debug Mode

Enable debug logging:
```bash
# Next.js debug
export DEBUG=next:*
npm run dev

# React Query debug
export REACT_QUERY_DEV=true
```

## Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```
3. **Make your changes**
4. **Follow coding standards**
   - Use TypeScript for all new code
   - Follow Tailwind CSS conventions
   - Write tests for new features
   - Update documentation
5. **Submit a pull request**

### Coding Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Follow configured rules
- **Prettier**: Use for code formatting
- **Commit Messages**: Follow conventional commits
- **Branch Naming**: Use descriptive names

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting section above

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Socket.IO Documentation](https://socket.io/docs/v4)
