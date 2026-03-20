export class CreateOrderDto {
    items: {
        foodId: string;
        quantity: number;
    }[];
}
