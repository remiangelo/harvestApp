export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image' | 'gif';
  imageUrl?: string;
}

export interface DemoChat {
  id: string;
  matchId: string;
  profileId: string;
  name: string;
  profileImage: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  messages: ChatMessage[];
}

export const demoChatMessages: Record<string, ChatMessage[]> = {
  'maya-24': [
    {
      id: 'msg1',
      senderId: 'maya-24',
      text: "Hey! I saw you're into filmmaking too! 🎬",
      timestamp: '2024-08-01T10:30:00Z',
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg2',
      senderId: 'current-user',
      text: "Yes! What kind of films do you usually work on?",
      timestamp: '2024-08-01T10:35:00Z',
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg3',
      senderId: 'maya-24',
      text: "Mostly documentaries about nature and wildlife. I love capturing stories that connect people to the environment 🌿",
      timestamp: '2024-08-01T10:40:00Z',
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg4',
      senderId: 'current-user',
      text: "That sounds amazing! I'd love to see some of your work",
      timestamp: '2024-08-01T10:45:00Z',
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg5',
      senderId: 'maya-24',
      text: "I just finished a short film about urban beekeeping! Want to grab coffee and I can show you some clips?",
      timestamp: '2024-08-01T20:15:00Z',
      isRead: false,
      type: 'text',
    },
  ],
  'sophie-26': [
    {
      id: 'msg6',
      senderId: 'sophie-26',
      text: "Your book recommendations look incredible! 📚",
      timestamp: '2024-08-01T09:00:00Z',
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg7',
      senderId: 'current-user',
      text: "Thanks! I see you're into sci-fi too. Have you read Klara and the Sun?",
      timestamp: '2024-08-01T09:15:00Z',
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg8',
      senderId: 'sophie-26',
      text: "YES! Ishiguro is brilliant. The way he explores consciousness and humanity... *chef's kiss*",
      timestamp: '2024-08-01T09:20:00Z',
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg9',
      senderId: 'sophie-26',
      text: "There's this amazing independent bookstore in the Mission that has a great sci-fi section. We should check it out!",
      timestamp: '2024-08-01T19:45:00Z',
      isRead: false,
      type: 'text',
    },
  ],
  'elena-28': [
    {
      id: 'msg10',
      senderId: 'elena-28',
      text: "I noticed we both love hiking! 🥾",
      timestamp: '2024-08-01T08:30:00Z',
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg11',
      senderId: 'current-user',
      text: "Yes! What's your favorite trail around here?",
      timestamp: '2024-08-01T08:45:00Z',
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg12',
      senderId: 'elena-28',
      text: "Lands End has the most incredible sunset views. I go there to unwind after long weeks at the hospital",
      timestamp: '2024-08-01T08:50:00Z',
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg13',
      senderId: 'elena-28',
      text: "Being a nurse can be intense, so nature really helps me recharge",
      timestamp: '2024-08-01T19:30:00Z',
      isRead: false,
      type: 'text',
    },
  ],
  'aria-25': [
    {
      id: 'msg14',
      senderId: 'aria-25',
      text: "Your travel photos are stunning! ✈️",
      timestamp: '2024-08-01T07:00:00Z',
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg15',
      senderId: 'current-user',
      text: "Thank you! Where's the most interesting place you've been?",
      timestamp: '2024-08-01T07:30:00Z',
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg16',
      senderId: 'aria-25',
      text: "I spent a month in Patagonia last year studying glacial patterns. The landscape was otherworldly",
      timestamp: '2024-08-01T07:35:00Z',
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg17',
      senderId: 'aria-25',
      text: "I'm planning a research trip to Iceland next summer. Want to hear about it over dinner? 🌋",
      timestamp: '2024-08-01T19:00:00Z',
      isRead: false,
      type: 'text',
    },
  ],
  'zoe-23': [
    {
      id: 'msg18',
      senderId: 'zoe-23',
      text: "I love your art! Do you have a gallery or exhibition coming up? 🎨",
      timestamp: '2024-08-01T11:00:00Z',
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg19',
      senderId: 'current-user',
      text: "Thanks! I'm actually working on a small show next month",
      timestamp: '2024-08-01T11:15:00Z',
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg20',
      senderId: 'zoe-23',
      text: "That's so exciting! I'd love to come support. I'm always looking for new artists to follow",
      timestamp: '2024-08-01T18:45:00Z',
      isRead: false,
      type: 'text',
    },
  ],
};

export const demoChats: DemoChat[] = [
  {
    id: 'chat-maya',
    matchId: 'match-maya-24',
    profileId: 'maya-24',
    name: 'Maya',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face',
    lastMessage: "I just finished a short film about urban beekeeping! Want to grab coffee and I can show you some clips?",
    lastMessageTime: '2024-08-01T20:15:00Z',
    unreadCount: 1,
    isOnline: true,
    messages: demoChatMessages['maya-24'],
  },
  {
    id: 'chat-sophie',
    matchId: 'match-sophie-26',
    profileId: 'sophie-26',
    name: 'Sophie',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    lastMessage: "There's this amazing independent bookstore in the Mission that has a great sci-fi section. We should check it out!",
    lastMessageTime: '2024-08-01T19:45:00Z',
    unreadCount: 1,
    isOnline: false,
    messages: demoChatMessages['sophie-26'],
  },
  {
    id: 'chat-elena',
    matchId: 'match-elena-28',
    profileId: 'elena-28',
    name: 'Elena',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    lastMessage: "Being a nurse can be intense, so nature really helps me recharge",
    lastMessageTime: '2024-08-01T19:30:00Z',
    unreadCount: 1,
    isOnline: true,
    messages: demoChatMessages['elena-28'],
  },
  {
    id: 'chat-aria',
    matchId: 'match-aria-25',
    profileId: 'aria-25',
    name: 'Aria',
    profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
    lastMessage: "I'm planning a research trip to Iceland next summer. Want to hear about it over dinner? 🌋",
    lastMessageTime: '2024-08-01T19:00:00Z',
    unreadCount: 1,
    isOnline: false,
    messages: demoChatMessages['aria-25'],
  },
  {
    id: 'chat-zoe',
    matchId: 'match-zoe-23',
    profileId: 'zoe-23',
    name: 'Zoe',
    profileImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face',
    lastMessage: "That's so exciting! I'd love to come support. I'm always looking for new artists to follow",
    lastMessageTime: '2024-08-01T18:45:00Z',
    unreadCount: 1,
    isOnline: true,
    messages: demoChatMessages['zoe-23'],
  },
];

export const getDemoChatById = (chatId: string): DemoChat | undefined => {
  return demoChats.find(chat => chat.id === chatId);
};

export const getDemoChatByProfileId = (profileId: string): DemoChat | undefined => {
  return demoChats.find(chat => chat.profileId === profileId);
};

export const getUnreadChatCount = (): number => {
  return demoChats.reduce((total, chat) => total + chat.unreadCount, 0);
};
