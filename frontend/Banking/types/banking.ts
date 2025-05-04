// export enum AccountType {
//     CHECKING = "checking",
//     SAVINGS = "savings",
//     CREDIT = "credit",
//     INVESTMENT = "investment"
// }
  
// export enum TransactionType {
//     DEPOSIT = "deposit",
//     WITHDRAWAL = "withdrawal",
//     TRANSFER = "transfer",
//     PAYMENT = "payment",
//     FEE = "fee",
//     INTEREST = "interest",
//     REFUND = "refund"
// }
  
// export enum TransactionStatus {
//     PENDING = "pending",
//     COMPLETED = "completed",
//     FAILED = "failed",
//     CANCELLED = "cancelled"
// }
  
// export enum CardType {
//     DEBIT = "debit",
//     CREDIT = "credit",
//     VIRTUAL = "virtual"
// }
  
// export enum CardStatus {
//     ACTIVE = "active",
//     INACTIVE = "inactive",
//     BLOCKED = "blocked",
//     EXPIRED = "expired"
// }
  
  
// export interface Account {
//     id: string;
//     account_number: string;
//     account_name: string;
//     account_type: AccountType | string;
//     balance: number;
//     currency: string;
//     is_primary: boolean;
//     is_active: boolean;
//     created_at: string;
//     last_transaction?: string;
    
//     credit_limit?: number;
//     available_credit?: number;
//     interest_rate?: number;
//     interest_rate_savings?: number;
// }
  
// export interface Transaction {
//     id: string;
//     transaction_id: string;
//     account_id: string;
//     transaction_type: TransactionType | string;
//     amount: number;
//     currency: string;
//     description: string;
//     category?: string;
//     status: TransactionStatus | string;
//     recipient_name?: string;
//     recipient_account_number?: string;
//     merchant_name?: string;
//     merchant_category?: string;
//     location?: string;
//     transaction_date: string;
// }
  
// export interface Card {
//     id: string;
//     account_id: string;
//     card_number: string;
//     card_type: CardType | string;
//     card_name: string;
//     expiry_date: string;
//     is_contactless: boolean;
//     daily_limit: number;
//     status: CardStatus | string;
//     is_virtual: boolean;
//     purpose?: string;
// }
  
// export interface Beneficiary {
//     id: string;
//     beneficiary_name: string;
//     account_number: string;
//     bank_name?: string;
//     bank_code?: string;
//     is_favorite: boolean;
// }
    
// export interface AccountCreateRequest {
//     account_name: string;
//     account_type: AccountType;
//     currency?: string;
//     is_primary?: boolean;
// }
  
// export interface TransferRequest {
//     from_account_id: string;
//     to_account_id?: string;
//     beneficiary_id?: string;
//     recipient_account_number?: string;
//     recipient_name?: string;
//     amount: number;
//     description: string;
// }
  
// export interface CardCreateRequest {
//     account_id: string;
//     card_name: string;
//     card_type?: CardType;
//     daily_limit?: number;
//     is_contactless?: boolean;
//     is_virtual?: boolean;
//     purpose?: string;
// }
  
// export interface BeneficiaryCreateRequest {
//     beneficiary_name: string;
//     account_number: string;
//     bank_name?: string;
//     bank_code?: string;
//     is_favorite?: boolean;
// }
  
  
// export interface TransactionFilter {
//     account_id?: string;
//     transaction_type?: TransactionType;
//     start_date?: string;
//     end_date?: string;
//     limit?: number;
//     offset?: number;
// }
  
// export interface AccountFilter {
//     account_type?: AccountType;
//     is_active?: boolean;
// }
  
// export interface CardFilter {
//     account_id?: string;
//     card_type?: CardType;
//     card_status?: CardStatus;
// }