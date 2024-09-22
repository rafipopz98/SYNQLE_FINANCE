export interface splitType {
  income: number;
  expense: number;
  balance?: number;
}

export type HistoryData = {
  expense: number;
  income: number;
  year: number;
  month: number;
  day?: number;
};
