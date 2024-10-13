"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOTAL_STOCKS = exports.ORDERBOOK = exports.STOCK_BALANCES = exports.INR_BALANCES = void 0;
exports.INR_BALANCES = {
    1: {
        balance: 1000,
        locked: 0,
    },
    2: {
        balance: 2000,
        locked: 10,
    },
};
exports.STOCK_BALANCES = {
    1: {
        BTC_USDT_10_Oct_2024_9_30: {
            yes: {
                quantity: 1,
                locked: 0,
            },
            no: {
                quantity: 0,
                locked: 0,
            },
        },
    },
    2: {
        BTC_USDT_10_Oct_2024_9_30: {
            yes: {
                quantity: 0,
                locked: 0,
            },
            no: {
                quantity: 3,
                locked: 4,
            },
        },
    },
};
exports.ORDERBOOK = {
    BTC_USDT_10_Oct_2024_9_30: {
        yes: {
            "9.5": {
                total: 12,
                orders: {
                    1: 2,
                    2: 10,
                },
            },
            "8.5": {
                total: 12,
                orders: {
                    1: 3,
                    2: 3,
                    3: 6,
                },
            },
        },
        no: {
            "9.5": {
                total: 12,
                orders: {
                    1: 2,
                    2: 10,
                },
            },
            "8.5": {
                total: 12,
                orders: {
                    1: 3,
                    2: 3,
                    3: 6,
                },
            },
        },
    },
};
exports.TOTAL_STOCKS = {
    BTC_USDT_10_Oct_2024_9_30: {
        total: 100,
        yes: 50,
        no: 50,
    },
};
