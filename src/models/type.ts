export type TypeProduct = {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  exp: string;
  discount: number;
  supplier_name: string;
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

export type TypeSupplier = {
  id: string;
  company_name: string;
  phone_company: string;
  sales_name: string;
  phone_sales: string;
}

export interface ProductForm {
  id: string;
  sku: string;
  name: string;
  price: string;
  stock: string;
  exp: string;
  supplier_name: string;
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
  transaction: CheckoutProduct[];
}
export interface CheckoutProduct {
  product_id: string;
  stock_id: string;
  qty: number;
}

