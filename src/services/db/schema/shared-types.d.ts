namespace PaymentMethods {
  type BankDetails = {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };

  type CryptoDetails = {
    address: string;
    network: string;
  };
}
