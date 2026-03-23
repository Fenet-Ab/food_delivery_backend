export class CreateOrderDto {
    items: {
        foodId: string;
        quantity: number;
    }[];
    address: string; // 👈 ADD THIS
    tx_ref?: string; // 👈 ADD THIS
}
