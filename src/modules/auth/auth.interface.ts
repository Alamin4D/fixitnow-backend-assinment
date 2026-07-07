export interface IUser {
    name: string;
    email: string;
    password: string;
    role: 'CUSTOMER' | 'TECHNICIAN';
    phone?: string;
    address?: string;
}