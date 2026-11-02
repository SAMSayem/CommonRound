export const EVENT_TYPES = [
  "Cleanup",
  "Plantation",
  "Donation",
  "Education",
  "Food Drive",
  "Health Camp",
  "Community Support",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export type CommunityEvent = {
  _id: string;
  title: string;
  description: string;
  eventType: EventType;
  imageUrl: string;
  location: string;
  eventDate: string;
  createdAt: string;
  updatedAt?: string;
  creatorId: string;
  creatorEmail?: string;
  creatorName: string;
  participantsCount?: number;
  joined?: boolean;
};

export type EventInput = Omit<CommunityEvent, "_id" | "createdAt" | "updatedAt" | "creatorId" | "creatorEmail" | "creatorName" | "participantsCount" | "joined">;

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};
