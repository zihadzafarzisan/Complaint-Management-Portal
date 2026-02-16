
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
  deletedAt?: string; // Timestamp when moved to recycle bin
  attachmentName?: string;
  attachmentData?: string; // Base64 string of the file
  attachmentType?: string; // MIME type of the file
}

export interface SubmissionStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}
