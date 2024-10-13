export interface Balances {
	[key: number]: {
		balance: number;
		locked: number;
	};
}

interface OrderDetails {
	quantity: number;
	locked: number;
}
interface StockSymbol {
	yes?: OrderDetails;
	no?: OrderDetails;
}
interface UserId {
	[key: string]: StockSymbol;
}
export interface StockBalances {
	[key: number]: UserId;
}

interface Orders {
	[key: string]: number;
}
interface StockPrice {
	[key: string]: {
		total: number;
		orders: Orders;
	};
}
interface StockSymbol_bal {
	yes: StockPrice;
	no: StockPrice;
}
export interface OrderBook {
	[key: string]: StockSymbol_bal;
}

export interface TotalStocks {
	[key: string]: {
		total: number;
		yes: number;
		no: number;
	};
}
