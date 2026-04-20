export type TypeProduct = {
  id: string;
  sku: string;
  name: string;
  size: string;
  price: number;
  capital: number;
  stock: number;
  exp: string;
  discount: number;
  discount_customer: number;
  supplier_name: string;
  profit_percentage: number;
};

export type TypeCustomer = {
  id: string;
  name: string;
  phone_number: string;
  created_at: string;
}

export type Pagination = {
  page: number;
  limit: number;
  total_data: number;
  total_pages: number;
};

export interface ProductForm {
  id: string;
  sku: string;
  name: string;
  size: string;
  price: string;
  stock: string;
  exp: string;
  supplier_name: string;
  discount_customer: string;
}

export interface InputProps {
  label: string;
  placeholder: string;
  value: string;
  type?: string;
  className: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export interface TypeTransaction{
  id: string;
  invoice_id: string;
  customer_id: string;
  customer_name: string;
  subtotal: number;
  product_discount_total: number;
  customer_discount: number;
  grand_total: number;
  created_by: string;
  cashier: string;
  created_at: string;
  transaction_detail: TypeTransactionDetail[];
}

export interface TypeTransactionCustomer{
  total_amount: number;
  total_transaction: number;
  transaction: TypeTransaction[];
}

export interface TypeTransactionDetail{
  id: string;
  product_id: string;
  product_name: string;
  product_size: string;
  qty: number;
  price: number;
  product_discount: number;
  total: number;
}

export interface PayloadTransaction{
  customer_id: string;
  use_discount_10?: boolean;
  transaction: CheckoutProduct[];
}
export interface CheckoutProduct {
  product_id: string;
  stock_id: string;
  qty: number;
}

export type TypeCustomerReturn = {
  id: string;
  transaction_detail_id: string;
  transaction_id: string;
  product_name: string;
  product_size: string;
  qty: number;
  refund_amount: number;
  condition: string;
  reason: string;
  created_by_name: string;
  created_at: string;
};

export type TempoProduct = {
  id: string;
  sku: string;
  name: string;
  size: string;
  supplier_name: string;
  stock: number;
  exp: string;
  price: number;
  discount: number;
  payment_method: string;
  status: string;
  due_payment: string;
};

