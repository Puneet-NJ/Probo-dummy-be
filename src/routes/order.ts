import { Router } from "express";
import { INR_BALANCES, STOCK_BALANCES, TOTAL_STOCKS, ORDERBOOK } from "../lib";

const router = Router();

router.post("/buy/yes", (req, res) => {
	const inputs = req.body;
	const stockSymbol = inputs.stockSymbol;
	const inputPrice = inputs.price;
	const price = String(inputPrice / 100);

	const quantity = Number(inputs.quantity);
	const userId = Number(inputs.userId);

	if (!INR_BALANCES[userId]) {
		res.status(411).json({ msg: "Invalid userId" });
		return;
	}

	if (TOTAL_STOCKS[stockSymbol].yes < quantity) {
		res.status(403).json({
			msg: `The remaining stocks are ${TOTAL_STOCKS[stockSymbol].yes} only`,
		});
		return;
	}
	// Ensure user has sufficient balance
	if (INR_BALANCES[userId]?.balance < inputs.quantity * inputs.price) {
		res.status(411).json({ msg: "Insufficient balance" });
		return;
	}

	if (!ORDERBOOK[stockSymbol] || !ORDERBOOK[stockSymbol].yes) {
		res.json({ msg: "Invalid stock symbol" });
		return;
	}

	// Initialize the price level in the order book if it doesn't exist
	if (!ORDERBOOK[stockSymbol].yes[price]) {
		ORDERBOOK[stockSymbol].yes[price] = {
			total: 0,
			orders: {},
		};
	}
	if (!ORDERBOOK[stockSymbol].yes[price].orders[userId]) {
		ORDERBOOK[stockSymbol].yes[price].orders[userId] = 0;
	}

	ORDERBOOK[stockSymbol].yes[price].total += quantity;
	ORDERBOOK[stockSymbol].yes[price].orders[userId] += quantity;

	// The question is do you want to add it to stock_balances, aswell?
	if (!STOCK_BALANCES[userId][stockSymbol]) {
		STOCK_BALANCES[userId][stockSymbol] = {
			yes: {
				quantity: 0,
				locked: 0,
			},
		};
	}
	STOCK_BALANCES[userId][stockSymbol].yes!.quantity += quantity;
	STOCK_BALANCES[userId][stockSymbol].yes!.locked += inputPrice * quantity;

	// Reduce the balance
	INR_BALANCES[userId].balance -= inputPrice * quantity;
	INR_BALANCES[userId].locked += inputPrice * quantity;

	// Update Total_stocks
	TOTAL_STOCKS[stockSymbol].total -= quantity;
	TOTAL_STOCKS[stockSymbol].yes -= quantity;

	res.json({ ORDERBOOK, STOCK_BALANCES, INR_BALANCES, TOTAL_STOCKS });
});

router.post("/sell/yes", (req, res) => {
	const inputs = req.body;
	const stockSymbol = String(inputs.stockSymbol);
	const inputPrice = inputs.price;
	const price = String(inputPrice / 100);
	const userId = inputs.userId;
	const quantity = inputs.quantity;

	if (!INR_BALANCES[userId]) {
		res.status(411).json({
			msg: "Invalid userId",
		});
		return;
	}

	// update orderbook
	if (!ORDERBOOK[stockSymbol] || !ORDERBOOK[stockSymbol].yes) {
		res.status(403).json({ msg: "Invalid stock symbol" });
		return;
	}

	if (!ORDERBOOK[stockSymbol].yes[price]) {
		res.status(403).json({ msg: "You haven't bought a stock at this price" });
		return;
	}

	if (ORDERBOOK[stockSymbol].yes[price].orders[userId] < quantity) {
		res.status(403).json({
			msg: "The number of shares that you have bought is lesser than this",
		});
		return;
	}

	ORDERBOOK[stockSymbol].yes[price].total -= quantity;
	ORDERBOOK[stockSymbol].yes[price].orders[userId] -= quantity;

	// update stock_balances
	if (
		!STOCK_BALANCES[userId] ||
		!STOCK_BALANCES[userId][stockSymbol] ||
		!STOCK_BALANCES[userId][stockSymbol].yes
	) {
		res.status(403).json({ msg: "You haven't bought this stock" });
		return;
	}

	if (
		STOCK_BALANCES[userId]?.[stockSymbol]?.yes &&
		STOCK_BALANCES![userId]![stockSymbol]!.yes!.quantity < quantity
	) {
		res.status(403).json({
			msg: "The number of shares that you have bought is lesser than this",
		});
		return;
	}
	STOCK_BALANCES![userId]![stockSymbol]!.yes!.quantity -= quantity;
	STOCK_BALANCES![userId]![stockSymbol]!.yes!.locked -= inputPrice * quantity;

	// update inr_balances
	INR_BALANCES[userId].balance += quantity * inputPrice;
	INR_BALANCES[userId].locked -= quantity * inputPrice;

	// Update Total_stocks
	TOTAL_STOCKS[stockSymbol].total += quantity;
	TOTAL_STOCKS[stockSymbol].yes += quantity;

	res.json({ ORDERBOOK, STOCK_BALANCES, INR_BALANCES, TOTAL_STOCKS });
});

router.post("/buy/no", (req, res) => {
	const inputs = req.body;
	const userId = inputs.userId;
	const stockSymbol = inputs.stockSymbol;
	const quantity = inputs.quantity;
	const inputPrice = inputs.price;
	const price = String(inputPrice / 100);

	if (!INR_BALANCES[userId]) {
		res.status(411).json({ msg: "Invalid userId" });
		return;
	}

	if (TOTAL_STOCKS[stockSymbol].no < quantity) {
		res.status(403).json({
			msg: `The remaining stocks are ${TOTAL_STOCKS[stockSymbol].no} only`,
		});
		return;
	}

	if (INR_BALANCES[userId].balance < quantity * inputPrice) {
		res.status(403).json({ msg: "Insufficient balance" });
		return;
	}

	// Update orderbook
	if (!ORDERBOOK[stockSymbol]) {
		res.status(411).json({ msg: "Invalid stock symbol" });
		return;
	}

	if (!ORDERBOOK[stockSymbol].no[price]) {
		ORDERBOOK[stockSymbol].no[price] = {
			total: 0,
			orders: {},
		};
	}

	if (!ORDERBOOK[stockSymbol].no[price].orders[userId]) {
		ORDERBOOK[stockSymbol].no[price].orders[userId] = 0;
	}

	ORDERBOOK[stockSymbol].no[price].orders[userId] += quantity;
	ORDERBOOK[stockSymbol].no[price].total += quantity;

	// Update stock_balances
	if (!STOCK_BALANCES[userId][stockSymbol]) {
		STOCK_BALANCES[userId][stockSymbol] = {
			yes: { quantity: 0, locked: 0 },
			no: { quantity: 0, locked: 0 },
		};
	}

	STOCK_BALANCES[userId][stockSymbol].no!.quantity += quantity;
	STOCK_BALANCES[userId][stockSymbol].no!.locked += quantity * inputPrice;

	// Update inr_balances
	INR_BALANCES[userId].balance -= quantity * inputPrice;
	INR_BALANCES[userId].locked += quantity * inputPrice;

	// Update Total_stocks
	TOTAL_STOCKS[stockSymbol].total -= quantity;
	TOTAL_STOCKS[stockSymbol].no -= quantity;

	res.json({ ORDERBOOK, STOCK_BALANCES, INR_BALANCES, TOTAL_STOCKS });
});

router.post("/sell/no", (req, res) => {
	const inputs = req.body;
	const stockSymbol = inputs.stockSymbol;
	const inputPrice = inputs.price;
	const price = String(inputPrice / 100);
	const quantity = inputs.quantity;
	const userId = inputs.userId;

	if (!INR_BALANCES[userId]) {
		res.status(403).json({ msg: "Invalid userId" });
	}

	// Update orderbook
	if (!ORDERBOOK[stockSymbol] || !ORDERBOOK[stockSymbol].no) {
		res.status(403).json({ msg: "Invalid stock symbol" });
		return;
	}

	if (!ORDERBOOK[stockSymbol].no[price]) {
		res
			.status(403)
			.json({ msg: "You haven't bought this stock at this price" });
		return;
	}

	if (ORDERBOOK[stockSymbol].no[price].orders[userId] < quantity) {
		res.status(411).json({ msg: "You have bought lesser quantity of stocks" });
		return;
	}
	ORDERBOOK[stockSymbol].no[price].total -= quantity;
	ORDERBOOK[stockSymbol].no[price].orders[userId] -= quantity;

	// Update stock_balances
	if (
		!STOCK_BALANCES[userId] ||
		!STOCK_BALANCES[userId][stockSymbol] ||
		!STOCK_BALANCES[userId][stockSymbol].no
	) {
		res.status(411).json({ msg: "You haven't bought this stock" });
		return;
	}

	if (STOCK_BALANCES[userId][stockSymbol].no!.quantity < quantity) {
		res
			.status(411)
			.json({ msg: "The quantity of stocks that you have bought is lesser" });
		return;
	}

	STOCK_BALANCES[userId][stockSymbol].no!.quantity -= quantity;
	STOCK_BALANCES[userId][stockSymbol].no!.locked -= inputPrice * quantity;

	// Update inr_balances
	INR_BALANCES[userId].balance += inputPrice * quantity;
	INR_BALANCES[userId].locked -= inputPrice * quantity;

	// Update Total_stocks
	TOTAL_STOCKS[stockSymbol].total += quantity;
	TOTAL_STOCKS[stockSymbol].no += quantity;

	res.json({ ORDERBOOK, STOCK_BALANCES, INR_BALANCES, TOTAL_STOCKS });
});

export default router;
