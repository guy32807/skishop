export type User = {
  firstName: string;
  lastName: string;
  email: string;
  address: Address
};

export type Address = {
  firstName?: string;
  lastName?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};