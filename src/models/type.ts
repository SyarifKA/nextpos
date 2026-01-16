export type TypeProduct = {
  id: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
  expired: string;
  supplier: string;
  year: string;
};

export type TypeCustomer = {
  id: string;
  name: string;
  createdAt: string;
}