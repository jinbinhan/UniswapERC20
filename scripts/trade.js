import { createTrade, executeTrade } from './libs/trading';

async function main() {
    // 创建交易
    const trade = await createTrade();
    console.log('交易已创建，正在执行...');

    // 执行交易
    const transactionState = await executeTrade(trade);
    console.log('交易状态:', transactionState);
}

main().catch(console.error);
