// next-env.d.ts or types/next-auth.d.ts


declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl?: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  }
}

export type Role = 'MENTOR' | 'LEARNER' | 'BOTH';
export type ConnectionStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';
export type SessionStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface UserProfessionDetails {
  id: string;
  title: string;
  userId: string;
}

export interface UserCurrentOrganization {
  id: string;
  organization: string;
  userId: string;
}

export interface UserExperienceSummary {
  id: string;
  years: number;
  description?: string | null;
  userId: string;
}

export interface UserCurrentStatus {
  id: string;
  status: string;
  userId: string;
}

export interface UserSocialLinks {
  id: string;
  linkedin?: string | null;
  github?: string | null;
  twitter?: string | null;
  leetcode?: string | null;
  website?: string | null;
  userId: string;
}

export interface Skill {
  id: string;
  name: string;
  category?: string | null;
}

export interface Session {
  id: string;
  mentorId: string;
  learnerId: string;
  skillId: string;
  scheduledAt: string; // ISO date
  status: SessionStatus;
  feedback?: string | null;
  createdAt: string;
}

export interface Connection {
  id: string;
  senderId: string;
  receiverId: string;
  status: ConnectionStatus;
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatarUrl?: string | null;
  role: Role;
  timeZone?: string | null;
  createdAt: string;
  bio?: string;
  // Embedded Relations
  professionDetails?: UserProfessionDetails | null;
  currentOrganization?: UserCurrentOrganization | null;
  experienceSummary?: UserExperienceSummary | null;
  currentStatus?: UserCurrentStatus | null;
  socialLinks?: UserSocialLinks | null;

  // Skill Relations
  skillsOffered: Skill[];
  skillsWanted: Skill[];

  // Sessions
  sessionsAsMentor: Session[];
  sessionsAsLearner: Session[];

  // Connections & Followers
  sentConnections: Connection[];
  receivedConnections: Connection[];
  followers: Follow[];
  following: Follow[];
}

    export interface profileData {
          name: string;
          bio: string;
          avatarUrl: string;
          timeZone: string;
          professionDetails: { title: string };
          currentOrganization: { organization: string };
          experienceSummary: { years: string };
          skillsOffered: string[];
          skillsWanted: string[];
     };