export interface Plan {
  id: number;
  operatorId: number;
  amount: number;
  validity: string;
  description: string;
}

export interface Operator {
  id: number;
  name: string;
  type: string;
  circle: string;
  plans: Plan[];
}
