export type TypeProduct = {
  id: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
  exp: string;
  supplier_name: string;
  year: string;
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