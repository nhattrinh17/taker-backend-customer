export enum PaymentEnum {
  OFFLINE_PAYMENT = 'OFFLINE_PAYMENT',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  CREDIT_CARD = 'CREDIT_CARD', // Using this method for both credit card and QR code
  QR_CODE = 'QR_CODE',
}

export enum PaymentStatusEnum {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELED = 'CANCELED',
  REFUNDED = 'REFUNDED',
  REFUNDED_FAILED = 'REFUNDED_FAILED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}
