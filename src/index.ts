import express from "express";
import { INR_BALANCES, STOCK_BALANCES, TOTAL_STOCKS, ORDERBOOK } from "./lib";
import router from "./routes/order";

const app = express();

app.use(express.json());

app.use("/order", router);

app.get("/", (req, res) => {
	res.json({ ORDERBOOK, STOCK_BALANCES, INR_BALANCES });
});

app.get("/user/create/:userId", (req, res) => {
	const userId = Number(req.params.userId);

	INR_BALANCES[userId] = { balance: 0, locked: 0 };
	STOCK_BALANCES[userId] = {};

	res.json({
		msg: "User created successfully",
		user: INR_BALANCES[`${userId}`],
	});
});

app.get("/symbol/create", (req, res) => {
	const inputs = req.body;
	const stockSymbol = inputs.stockSymbol;
	const numOfStocks = Number(inputs.numOfStocks);

	ORDERBOOK[stockSymbol] = { yes: {}, no: {} };

	TOTAL_STOCKS[stockSymbol].total = numOfStocks;
	TOTAL_STOCKS[stockSymbol].no = numOfStocks / 2;
	TOTAL_STOCKS[stockSymbol].yes = numOfStocks / 2;

	res.json({
		msg: "Created stock symbol",
		newSymbol: ORDERBOOK[stockSymbol],
		ORDERBOOK,
	});
});

app.get("/balance/inr/:userId", (req, res) => {
	const userId = Number(req.params.userId);

	const balance = INR_BALANCES[userId].balance;

	res.status(200).json({ balance: balance / 100 });
});

app.post("/onramp/inr", (req, res) => {
	const inputs = req.body;

	const userId = Number(inputs.userId);
	const amount = Number(inputs.amount);

	INR_BALANCES[userId].balance += amount;

	res.json({ newBalance: INR_BALANCES[userId].balance / 100 });
});

app.get("/balance/stock/:userId", (req, res) => {
	const userId = Number(req.params.userId);

	const stockBalance = STOCK_BALANCES[userId];

	res.json({ stockBalance: { userId, ...stockBalance } });
});

app.get("/orderbook/:stockSymbol", (req, res) => {
	const stockSymbol = req.params.stockSymbol;

	const data = ORDERBOOK[stockSymbol];

	res.json({ data });
});

app.post("/trade/mint", (req, res) => {
	const inputs = req.body;
	const yesInc = inputs.yesInc;
	const noInc = inputs.noInc;
	const stockSymbol = inputs.stockSymbol;

	TOTAL_STOCKS[stockSymbol].total =
		TOTAL_STOCKS[stockSymbol].total + yesInc + noInc;
	TOTAL_STOCKS[stockSymbol].yes = yesInc;
	TOTAL_STOCKS[stockSymbol].no = noInc;

	res.json({ TOTAL_STOCKS });
});

app.listen(3000);
