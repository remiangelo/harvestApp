export interface DemoProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  hobbies: string[];
  location: string;
  gender: string;
  sexualIdentity: string;
  relationshipGoals: string[];
}

export const demoProfiles: DemoProfile[] = [
  {
    id: '1',
    name: 'Sarah',
    age: 26,
    bio: 'Adventure seeker and coffee enthusiast ☕️ Love hiking, photography, and trying new restaurants. Looking for someone who shares my passion for exploring the world and meaningful conversations.',
    photos: [
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    ],
    hobbies: ['Hiking', 'Photography', 'Coffee', 'Travel', 'Cooking'],
    location: 'San Francisco, CA',
    gender: 'Woman',
    sexualIdentity: 'Straight',
    relationshipGoals: ['Long-term relationship', 'Friendship'],
  },
  {
    id: '2',
    name: 'Alex',
    age: 28,
    bio: 'Software engineer by day, musician by night 🎸 Passionate about technology, indie music, and craft beer. Looking for someone who can appreciate both my analytical mind and creative side.',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    ],
    hobbies: ['Coding', 'Guitar', 'Craft Beer', 'Board Games', 'Hiking'],
    location: 'Austin, TX',
    gender: 'Man',
    sexualIdentity: 'Straight',
    relationshipGoals: ['Long-term relationship', 'Casual dating'],
  },
  {
    id: '3',
    name: 'Maya',
    age: 24,
    bio: 'Yoga instructor and wellness advocate 🧘‍♀️ Love meditation, healthy cooking, and spending time in nature. Seeking someone who values mindfulness and personal growth.',
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face',
    ],
    hobbies: ['Yoga', 'Meditation', 'Cooking', 'Nature Walks', 'Reading'],
    location: 'Portland, OR',
    gender: 'Woman',
    sexualIdentity: 'Bisexual',
    relationshipGoals: ['Long-term relationship', 'Friendship'],
  },
  {
    id: '4',
    name: 'Jordan',
    age: 29,
    bio: 'Environmental scientist and outdoor enthusiast 🌿 Love rock climbing, sustainable living, and stargazing. Looking for someone who cares about the planet and enjoys adventure.',
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    ],
    hobbies: ['Rock Climbing', 'Sustainability', 'Astronomy', 'Camping', 'Gardening'],
    location: 'Denver, CO',
    gender: 'Non-binary',
    sexualIdentity: 'Pansexual',
    relationshipGoals: ['Long-term relationship', 'Casual dating'],
  },
  {
    id: '5',
    name: 'Emma',
    age: 27,
    bio: 'Art director and creative soul 🎨 Passionate about design, vintage fashion, and indie films. Looking for someone who appreciates creativity and can have deep conversations about art and life.',
    photos: [
      'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    ],
    hobbies: ['Design', 'Vintage Fashion', 'Indie Films', 'Art Galleries', 'Coffee'],
    location: 'Los Angeles, CA',
    gender: 'Woman',
    sexualIdentity: 'Lesbian',
    relationshipGoals: ['Long-term relationship', 'Friendship'],
  },
  {
    id: '6',
    name: 'David',
    age: 31,
    bio: 'Chef and food lover 👨‍🍳 Love experimenting with new recipes, wine tasting, and hosting dinner parties. Seeking someone who appreciates good food and great conversation.',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    ],
    hobbies: ['Cooking', 'Wine Tasting', 'Travel', 'Photography', 'Music'],
    location: 'New York, NY',
    gender: 'Man',
    sexualIdentity: 'Gay',
    relationshipGoals: ['Long-term relationship', 'Casual dating'],
  },
  {
    id: '7',
    name: 'Sophia',
    age: 25,
    bio: 'Medical student and fitness enthusiast 💪 Love running, reading medical journals, and volunteering. Looking for someone who supports my career goals and shares my passion for helping others.',
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face',
    ],
    hobbies: ['Running', 'Reading', 'Volunteering', 'Yoga', 'Travel'],
    location: 'Boston, MA',
    gender: 'Woman',
    sexualIdentity: 'Straight',
    relationshipGoals: ['Long-term relationship'],
  },
  {
    id: '8',
    name: 'Marcus',
    age: 30,
    bio: 'Financial analyst and sports fan 🏈 Love watching football, playing basketball, and discussing investments. Looking for someone who can keep up with my competitive spirit and enjoys game nights.',
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    ],
    hobbies: ['Football', 'Basketball', 'Investing', 'Game Nights', 'Gym'],
    location: 'Chicago, IL',
    gender: 'Man',
    sexualIdentity: 'Straight',
    relationshipGoals: ['Long-term relationship', 'Casual dating'],
  },
];
