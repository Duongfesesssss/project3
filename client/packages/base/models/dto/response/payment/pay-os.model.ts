export class PayOsModel {
  success: boolean;
  data?: {
    checkoutUrl: string;
    qrCode: string;
    orderId: string | number;
    amount: number;
    description: string;
  };
  message?: string;
  instructions?: {
    title: string;
    steps: string[];
  };

  constructor(init?: {
    success: boolean;
    data?: {
      checkoutUrl: string;
      qrCode: string;
      orderId: string | number;
      amount: number;
      description: string;
    };
    message?: string;
    instructions?: {
      title: string;
      steps: string[];
    };
  }) {
    this.success = init?.success ?? false;
    this.data = init?.data;
    this.message = init?.message;
    this.instructions = init?.instructions;
  }
}

export class PayOsWebhookModel {
  code: string;
  desc: string;
  success: boolean;
  data?: {
    orderCode: number;
    amount: number;
    description: string;
    accountNumber: string;
    reference: string;
    transactionDateTime: string;
    currency: string;
    paymentLinkId: string;
    code: string;
    desc: string;
    counterAccountBankId: string;
    counterAccountBankName: string;
    counterAccountName: string;
    counterAccountNumber: string;
    virtualAccountName: string;
    virtualAccountNumber: string;
  };
  signature?: string;

  constructor(init?: {
    code: string;
    desc: string;
    success: boolean;
    data?: {
      orderCode: number;
      amount: number;
      description: string;
      accountNumber: string;
      reference: string;
      transactionDateTime: string;
      currency: string;
      paymentLinkId: string;
      code: string;
      desc: string;
      counterAccountBankId: string;
      counterAccountBankName: string;
      counterAccountName: string;
      counterAccountNumber: string;
      virtualAccountName: string;
      virtualAccountNumber: string;
    };
    signature?: string;
  }) {
    this.code = init?.code ?? '';
    this.desc = init?.desc ?? '';
    this.success = init?.success ?? false;
    this.data = init?.data;
    this.signature = init?.signature;
  }
}

