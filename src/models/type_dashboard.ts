export interface ChartItem {
  name: string
  value: number
}

export interface DashboardData {
  total_customers: number
  total_transaction: number
  amount_transaction: number
  cost: number
  gross_profit: number

  daily_data: ChartItem[]
  monthly_data: ChartItem[]
  yearly_data: ChartItem[]
}
