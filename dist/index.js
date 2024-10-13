"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lib_1 = require("./lib");
const order_1 = __importDefault(require("./routes/order"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.json({ ORDERBOOK: lib_1.ORDERBOOK, STOCK_BALANCES: lib_1.STOCK_BALANCES, INR_BALANCES: lib_1.INR_BALANCES });
});
app.get("/user/create/:userId", (req, res) => {
    const userId = Number(req.params.userId);
    lib_1.INR_BALANCES[userId] = { balance: 0, locked: 0 };
    lib_1.STOCK_BALANCES[userId] = {};
    res.json({
        msg: "User created successfully",
        user: lib_1.INR_BALANCES[`${userId}`],
    });
});
app.get("/symbol/create", (req, res) => {
    const inputs = req.body;
    const stockSymbol = inputs.stockSymbol;
    const numOfStocks = Number(inputs.numOfStocks);
    lib_1.ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
    lib_1.TOTAL_STOCKS[stockSymbol].total = numOfStocks;
    lib_1.TOTAL_STOCKS[stockSymbol].no = numOfStocks / 2;
    lib_1.TOTAL_STOCKS[stockSymbol].yes = numOfStocks / 2;
    res.json({
        msg: "Created stock symbol",
        newSymbol: lib_1.ORDERBOOK[stockSymbol],
        ORDERBOOK: lib_1.ORDERBOOK,
    });
});
app.get("/balance/inr/:userId", (req, res) => {
    const userId = Number(req.params.userId);
    const balance = lib_1.INR_BALANCES[userId].balance;
    res.status(200).json({ balance: balance / 100 });
});
app.post("/onramp/inr", (req, res) => {
    const inputs = req.body;
    const userId = Number(inputs.userId);
    const amount = Number(inputs.amount);
    lib_1.INR_BALANCES[userId].balance += amount;
    res.json({ newBalance: lib_1.INR_BALANCES[userId].balance / 100 });
});
app.get("/balance/stock/:userId", (req, res) => {
    const userId = Number(req.params.userId);
    const stockBalance = lib_1.STOCK_BALANCES[userId];
    res.json({ stockBalance: Object.assign({ userId }, stockBalance) });
});
app.use("/order", order_1.default);
app.get("/orderbook/:stockSymbol", (req, res) => {
    const stockSymbol = req.params.stockSymbol;
    const data = lib_1.ORDERBOOK[stockSymbol];
    res.json({ data });
});
app.post("/trade/mint", (req, res) => {
    const inputs = req.body;
    const yesInc = inputs.yesInc;
    const noInc = inputs.noInc;
    const stockSymbol = inputs.stockSymbol;
    lib_1.TOTAL_STOCKS[stockSymbol].total =
        lib_1.TOTAL_STOCKS[stockSymbol].total + yesInc + noInc;
    lib_1.TOTAL_STOCKS[stockSymbol].yes = yesInc;
    lib_1.TOTAL_STOCKS[stockSymbol].no = noInc;
    res.json({ TOTAL_STOCKS: lib_1.TOTAL_STOCKS });
});
app.listen(3000);
