import {nanoid} from 'nanoid';
export type CartType = {
    id: string;
    userId: string;
    items: CartItem[];
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}

export type CartItem = {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    pictureUrl: string;
    brand: string;
    type: string;
}

export class Cart implements CartType {
    id: string = nanoid();
    userId: string = '';
    items: CartItem[] = [];
    totalAmount: number = 0;
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}