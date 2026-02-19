
export interface ComplaintForm {
  id: string;
  name?: string;
  mobile: string;
  email?: string;
  address: string;
  subject: string;
  details: string;
  isPrivate: boolean;
  status: 'pending' | 'solved' | 'rejected';
  submittedAt: string;
  deletedAt?: string;
  attachmentName?: string;
  attachmentData?: string;
  attachmentType?: string;
  adminFeedback?: string; // New field for admin comments
  isRead?: boolean;       // New field to track unread complaints
}

export interface SubmissionStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}
