export interface DemoUser {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  // Onboarding data
  onboardingCompleted?: boolean;
  age?: Date;
  preferences?: string;
  bio?: string;
  nickname?: string;
  photos?: string[];
  hobbies?: string[];
  distance?: number;
  goals?: string;
  gender?: string;
  location?: string;
}

export const demoUsers: DemoUser[] = [
  {
    email: 'demo@harvest.com',
    password: 'demo123',
    name: 'Demo User',
    role: 'user',
    onboardingCompleted: true,
    age: new Date(1995, 5, 15), // June 15, 1995 (28 years old)
    preferences: 'Straight',
    bio: 'Adventure seeker and coffee enthusiast ☕️ Love hiking, photography, and trying new restaurants. Looking for someone who shares my passion for exploring the world and meaningful conversations.',
    nickname: 'Demo',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face'
    ],
    hobbies: ['Hiking', 'Photography', 'Coffee', 'Travel', 'Cooking'],
    distance: 25,
    goals: 'Relationship',
    gender: 'Straight',
    location: 'San Francisco, CA'
  },
  {
    email: 'admin@harvest.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    onboardingCompleted: true,
    age: new Date(1990, 2, 10), // March 10, 1990 (33 years old)
    preferences: 'Straight',
    bio: 'Tech enthusiast and fitness lover 💪 Passionate about innovation, healthy living, and building meaningful connections. Looking for someone who values growth and adventure.',
    nickname: 'Admin',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
    ],
    hobbies: ['Technology', 'Fitness', 'Reading', 'Travel', 'Cooking'],
    distance: 30,
    goals: 'Relationship',
    gender: 'Straight',
    location: 'New York, NY'
  },
  {
    email: 'test@harvest.com',
    password: 'test123',
    name: 'Test User',
    role: 'user',
    onboardingCompleted: true,
    age: new Date(1998, 8, 22), // September 22, 1998 (25 years old)
    preferences: 'Bisexual',
    bio: 'Creative soul and music lover 🎵 Always exploring new places and meeting interesting people. Looking for genuine connections and shared adventures.',
    nickname: 'Test',
    photos: [
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face'
    ],
    hobbies: ['Music', 'Art', 'Travel', 'Photography', 'Dancing'],
    distance: 20,
    goals: 'Dating',
    gender: 'Bisexual',
    location: 'Los Angeles, CA'
  }
];

export const validateLogin = (email: string, password: string): DemoUser | null => {
  const user = demoUsers.find(
    user => user.email.toLowerCase() === email.toLowerCase() && user.password === password
  );
  return user || null;
};

export const getDemoUserByEmail = (email: string): DemoUser | null => {
  return demoUsers.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
}; 