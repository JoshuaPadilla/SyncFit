export type SucessCheckoutMetadata = {
  amount: number;
  planId: string;
  userId: string;
  paymongoReference: string;
  paymentMethod: string;
  rawWebhookData: any;
};
