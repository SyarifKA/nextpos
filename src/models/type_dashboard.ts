export interface ChartItem {
  name: string
  value: number
}

export interface DashboardData {
  total_customers: number
  total_transaction_per_day: number
  total_transaction_per_month: number
  total_transaction_per_year: number

  amount_transaction_per_day: number
  amount_transaction_per_month: number
  amount_transaction_per_year: number

  cost_per_year: number

  daily_data: ChartItem[]
  monthly_data: ChartItem[]
  yearly_data: ChartItem[]
}
