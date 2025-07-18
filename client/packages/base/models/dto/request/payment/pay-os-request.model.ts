export class PayOsRequestModel {
  amount: number;
  description: string;
  orderId: string | number;
  returnUrl: string;
  cancelUrl: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;

  constructor(init?: {
    amount: number;
    description: string;
    orderId: string | number;
    returnUrl: string;
    cancelUrl: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
  }) {
    this.amount = init?.amount ?? 0;
    this.description = init?.description ?? '';
    this.orderId = init?.orderId ?? '';
    this.returnUrl = init?.returnUrl ?? '';
    this.cancelUrl = init?.cancelUrl ?? '';
    this.buyerName = init?.buyerName ?? '';
    this.buyerEmail = init?.buyerEmail ?? '';
    this.buyerPhone = init?.buyerPhone ?? '';
  }
}