"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lib_1 = require("../lib");
const router = (0, express_1.Router)();
router.post("/buy/yes", (req, res) => {
    var _a;
    const inputs = req.body;
    const stockSymbol = inputs.stockSymbol;
    const inputPrice = inputs.price;
    const price = String(inputPrice / 100);
    const quantity = Number(inputs.quantity);
    const userId = Number(inputs.userId);
    if (!lib_1.INR_BALANCES[userId]) {
        res.status(411).json({ msg: "Invalid userId" });
        return;
    }
    if (lib_1.TOTAL_STOCKS[stockSymbol].yes < quantity) {
        res.status(403).json({
            msg: `The remaining stocks are ${lib_1.TOTAL_STOCKS[stockSymbol].yes} only`,
        });
        return;
    }
    // Ensure user has sufficient balance
    if (((_a = lib_1.INR_BALANCES[userId]) === null || _a === void 0 ? void 0 : _a.balance) < inputs.quantity * inputs.price) {
        res.status(411).json({ msg: "Insufficient balance" });
        return;
    }
    if (!lib_1.ORDERBOOK[stockSymbol] || !lib_1.ORDERBOOK[stockSymbol].yes) {
        res.json({ msg: "Invalid stock symbol" });
        return;
    }
    // Initialize the price level in the order book if it doesn't exist
    if (!lib_1.ORDERBOOK[stockSymbol].yes[price]) {
        lib_1.ORDERBOOK[stockSymbol].yes[price] = {
            total: 0,
            orders: {},
        };
    }
    if (!lib_1.ORDERBOOK[stockSymbol].yes[price].orders[userId]) {
        lib_1.ORDERBOOK[stockSymbol].yes[price].orders[userId] = 0;
    }
    lib_1.ORDERBOOK[stockSymbol].yes[price].total += quantity;
    lib_1.ORDERBOOK[stockSymbol].yes[price].orders[userId] += quantity;
    // The question is do you want to add it to stock_balances, aswell?
    if (!lib_1.STOCK_BALANCES[userId][stockSymbol]) {
        lib_1.STOCK_BALANCES[userId][stockSymbol] = {
            yes: {
                quantity: 0,
                locked: 0,
            },
        };
    }
    lib_1.STOCK_BALANCES[userId][stockSymbol].yes.quantity += quantity;
    lib_1.STOCK_BALANCES[userId][stockSymbol].yes.locked += inputPrice * quantity;
    // Reduce the balance
    lib_1.INR_BALANCES[userId].balance -= inputPrice * quantity;
    lib_1.INR_BALANCES[userId].locked += inputPrice * quantity;
    // Update Total_stocks
    lib_1.TOTAL_STOCKS[stockSymbol].total -= quantity;
    lib_1.TOTAL_STOCKS[stockSymbol].yes -= quantity;
    res.json({ ORDERBOOK: lib_1.ORDERBOOK, STOCK_BALANCES: lib_1.STOCK_BALANCES, INR_BALANCES: lib_1.INR_BALANCES, TOTAL_STOCKS: lib_1.TOTAL_STOCKS });
});
router.post("/sell/yes", (req, res) => {
    var _a, _b;
    const inputs = req.body;
    const stockSymbol = String(inputs.stockSymbol);
    const inputPrice = inputs.price;
    const price = String(inputPrice / 100);
    const userId = inputs.userId;
    const quantity = inputs.quantity;
    if (!lib_1.INR_BALANCES[userId]) {
        res.status(411).json({
            msg: "Invalid userId",
        });
        return;
    }
    // update orderbook
    if (!lib_1.ORDERBOOK[stockSymbol] || !lib_1.ORDERBOOK[stockSymbol].yes) {
        res.status(403).json({ msg: "Invalid stock symbol" });
        return;
    }
    if (!lib_1.ORDERBOOK[stockSymbol].yes[price]) {
        res.status(403).json({ msg: "You haven't bought a stock at this price" });
        return;
    }
    if (lib_1.ORDERBOOK[stockSymbol].yes[price].orders[userId] < quantity) {
        res.status(403).json({
            msg: "The number of shares that you have bought is lesser than this",
        });
        return;
    }
    lib_1.ORDERBOOK[stockSymbol].yes[price].total -= quantity;
    lib_1.ORDERBOOK[stockSymbol].yes[price].orders[userId] -= quantity;
    // update stock_balances
    if (!lib_1.STOCK_BALANCES[userId] ||
        !lib_1.STOCK_BALANCES[userId][stockSymbol] ||
        !lib_1.STOCK_BALANCES[userId][stockSymbol].yes) {
        res.status(403).json({ msg: "You haven't bought this stock" });
        return;
    }
    if (((_b = (_a = lib_1.STOCK_BALANCES[userId]) === null || _a === void 0 ? void 0 : _a[stockSymbol]) === null || _b === void 0 ? void 0 : _b.yes) &&
        lib_1.STOCK_BALANCES[userId][stockSymbol].yes.quantity < quantity) {
        res.status(403).json({
            msg: "The number of shares that you have bought is lesser than this",
        });
        return;
    }
    lib_1.STOCK_BALANCES[userId][stockSymbol].yes.quantity -= quantity;
    lib_1.STOCK_BALANCES[userId][stockSymbol].yes.locked -= inputPrice * quantity;
    // update inr_balances
    lib_1.INR_BALANCES[userId].balance += quantity * inputPrice;
    lib_1.INR_BALANCES[userId].locked -= quantity * inputPrice;
    // Update Total_stocks
    lib_1.TOTAL_STOCKS[stockSymbol].total += quantity;
    lib_1.TOTAL_STOCKS[stockSymbol].yes += quantity;
    res.json({ ORDERBOOK: lib_1.ORDERBOOK, STOCK_BALANCES: lib_1.STOCK_BALANCES, INR_BALANCES: lib_1.INR_BALANCES, TOTAL_STOCKS: lib_1.TOTAL_STOCKS });
});
router.post("/buy/no", (req, res) => {
    const inputs = req.body;
    const userId = inputs.userId;
    const stockSymbol = inputs.stockSymbol;
    const quantity = inputs.quantity;
    const inputPrice = inputs.price;
    const price = String(inputPrice / 100);
    if (!lib_1.INR_BALANCES[userId]) {
        res.status(411).json({ msg: "Invalid userId" });
        return;
    }
    if (lib_1.TOTAL_STOCKS[stockSymbol].no < quantity) {
        res.status(403).json({
            msg: `The remaining stocks are ${lib_1.TOTAL_STOCKS[stockSymbol].no} only`,
        });
        return;
    }
    if (lib_1.INR_BALANCES[userId].balance < quantity * inputPrice) {
        res.status(403).json({ msg: "Insufficient balance" });
        return;
    }
    // Update orderbook
    if (!lib_1.ORDERBOOK[stockSymbol]) {
        res.status(411).json({ msg: "Invalid stock symbol" });
        return;
    }
    if (!lib_1.ORDERBOOK[stockSymbol].no[price]) {
        lib_1.ORDERBOOK[stockSymbol].no[price] = {
            total: 0,
            orders: {},
        };
    }
    if (!lib_1.ORDERBOOK[stockSymbol].no[price].orders[userId]) {
        lib_1.ORDERBOOK[stockSymbol].no[price].orders[userId] = 0;
    }
    lib_1.ORDERBOOK[stockSymbol].no[price].orders[userId] += quantity;
    lib_1.ORDERBOOK[stockSymbol].no[price].total += quantity;
    // Update stock_balances
    if (!lib_1.STOCK_BALANCES[userId][stockSymbol]) {
        lib_1.STOCK_BALANCES[userId][stockSymbol] = {
            yes: { quantity: 0, locked: 0 },
            no: { quantity: 0, locked: 0 },
        };
    }
    lib_1.STOCK_BALANCES[userId][stockSymbol].no.quantity += quantity;
    lib_1.STOCK_BALANCES[userId][stockSymbol].no.locked += quantity * inputPrice;
    // Update inr_balances
    lib_1.INR_BALANCES[userId].balance -= quantity * inputPrice;
    lib_1.INR_BALANCES[userId].locked += quantity * inputPrice;
    // Update Total_stocks
    lib_1.TOTAL_STOCKS[stockSymbol].total -= quantity;
    lib_1.TOTAL_STOCKS[stockSymbol].no -= quantity;
    res.json({ ORDERBOOK: lib_1.ORDERBOOK, STOCK_BALANCES: lib_1.STOCK_BALANCES, INR_BALANCES: lib_1.INR_BALANCES, TOTAL_STOCKS: lib_1.TOTAL_STOCKS });
});
router.post("/sell/no", (req, res) => {
    const inputs = req.body;
    const stockSymbol = inputs.stockSymbol;
    const inputPrice = inputs.price;
    const price = String(inputPrice / 100);
    const quantity = inputs.quantity;
    const userId = inputs.userId;
    if (!lib_1.INR_BALANCES[userId]) {
        res.status(403).json({ msg: "Invalid userId" });
    }
    // Update orderbook
    if (!lib_1.ORDERBOOK[stockSymbol] || !lib_1.ORDERBOOK[stockSymbol].no) {
        res.status(403).json({ msg: "Invalid stock symbol" });
        return;
    }
    if (!lib_1.ORDERBOOK[stockSymbol].no[price]) {
        res
            .status(403)
            .json({ msg: "You haven't bought this stock at this price" });
        return;
    }
    if (lib_1.ORDERBOOK[stockSymbol].no[price].orders[userId] < quantity) {
        res.status(411).json({ msg: "You have bought lesser quantity of stocks" });
        return;
    }
    lib_1.ORDERBOOK[stockSymbol].no[price].total -= quantity;
    lib_1.ORDERBOOK[stockSymbol].no[price].orders[userId] -= quantity;
    // Update stock_balances
    if (!lib_1.STOCK_BALANCES[userId] ||
        !lib_1.STOCK_BALANCES[userId][stockSymbol] ||
        !lib_1.STOCK_BALANCES[userId][stockSymbol].no) {
        res.status(411).json({ msg: "You haven't bought this stock" });
        return;
    }
    if (lib_1.STOCK_BALANCES[userId][stockSymbol].no.quantity < quantity) {
        res
            .status(411)
            .json({ msg: "The quantity of stocks that you have bought is lesser" });
        return;
    }
    lib_1.STOCK_BALANCES[userId][stockSymbol].no.quantity -= quantity;
    lib_1.STOCK_BALANCES[userId][stockSymbol].no.locked -= inputPrice * quantity;
    // Update inr_balances
    lib_1.INR_BALANCES[userId].balance += inputPrice * quantity;
    lib_1.INR_BALANCES[userId].locked -= inputPrice * quantity;
    // Update Total_stocks
    lib_1.TOTAL_STOCKS[stockSymbol].total += quantity;
    lib_1.TOTAL_STOCKS[stockSymbol].no += quantity;
    res.json({ ORDERBOOK: lib_1.ORDERBOOK, STOCK_BALANCES: lib_1.STOCK_BALANCES, INR_BALANCES: lib_1.INR_BALANCES, TOTAL_STOCKS: lib_1.TOTAL_STOCKS });
});
exports.default = router;
