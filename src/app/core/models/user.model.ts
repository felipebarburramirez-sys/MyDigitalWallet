export type DocumentType = 'CC' | 'TI' | 'CE' | 'PAS';

export interface UserProfile {
  uid: string;
  name: string;
  lastname: string;
  documentType: DocumentType;
  documentNumber: string;
  country: string;
  email: string;
  createdAt: number;
  biometricEnabled?: boolean;
}
