# Trip wallet

One trip. One PaySplit card. Two funding cards.

Merchants charge that one card for the full amount. PaySplit records two collection lines. The merchant authorization is not split. Two caps must sum to the cart in exact cents, or the whole cart is declined. A cap larger than what is left on that card declines the cart too.

Sample only. No bank, issuer, or card is charged.

## Sample

Austin, Nov 14–17.

- Everyday Visa ····4242, cap $400.00
- World Mastercard ····8188, cap $250.00
- Budget $650.00. PaySplit ····7714, exp 09/28

The Line Hotel, $180.00, caps $110.00 and $70.00. DoorDash · Luna Thai, $25.00, caps $15.00 and $10.00.

## Run

```bash
npm install
npm test
npx expo start
```
