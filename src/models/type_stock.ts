export interface TypeStock {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  price: number;
  qty: number;
  exp: string;
}

export interface TypeStockMovement {
    id: string;
    sku: string;
    product_id: string;
    product_name: string;
    type: string;
    qty: number;
    created_at: string;
    created_by_name: string;
    created_by_id: string;
}