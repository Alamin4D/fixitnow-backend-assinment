export interface IRegisterUser {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    address?: string;
}