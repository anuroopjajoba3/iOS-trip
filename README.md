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

## Build the iPhone app

This is an iOS app. Do not use Expo Go, a QR code, or a website host.

On a Mac with Xcode installed:

```bash
cd iOS-trip
git checkout cursor/ios-trip-wallet-7340
npm install
npm run ios:release
```

That puts **Trip Wallet** on the Simulator as a real app. It does not need Metro or a QR code.

To install on a plugged-in iPhone:

```bash
npm run ios:device
```

Xcode will ask you to sign with your Apple ID. A free Apple ID works for your own phone. TestFlight and the App Store need a paid Apple Developer account, then:

```bash
npx eas-cli login
npx eas-cli build --platform ios --profile preview
```

`preview` makes an installable iOS build. `production` is the App Store build. Money in the app is still sample only. No bank is charged.
