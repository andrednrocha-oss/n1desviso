
export type EscalationLevel = '1ª Escalada' | '2ª Escalada' | '3ª Escalada' | '4ª Escalada' | '5ª Escalada';

export interface CallValidation {
  calledCustomer: boolean;
  evaluatedEquipment: boolean;
  customerDetails?: {
    name: string;
    matricula: string;
  };
  dispenser: boolean;
  depositary: boolean;
  barcodeReader: boolean;
  printer: boolean;
  checkDepositary: boolean;
  sensoriamento: boolean;
  smartPower: boolean;
  closureAuth: {
    name: string;
    department: string;
  };
}

export interface Deviation {
  id: string;
  analystName: string;
  escalationLevel: EscalationLevel;
  ticketNumber: string;
  location: string;
  closingDate: string;
  validation: CallValidation;
  createdAt: string;
}

export interface DashboardStats {
  totalDeviations: number;
  analystRanking: { name: string; count: number }[];
  locationStats: { location: string; count: number }[];
}
