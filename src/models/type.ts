export type TypeProduct = {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  exp: string;
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