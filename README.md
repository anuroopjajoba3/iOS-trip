# Trip wallet

One trip. One PaySplit card. Two funding cards.

Merchants charge that one card for the full amount. PaySplit records two collection lines. The merchant authorization is not split. Two caps must sum to the cart in exact cents, or the whole cart is declined. A cap larger than what is left on that card declines the cart too.

Sign up. Start your own trip. There is no preloaded Austin demo.

Merchants still only charge the PaySplit card. Money in the app is recorded on the phone. No bank, issuer, or card is charged.

## Use

1. Sign up with your name, email, and password.
2. Start a trip: name, dates, last four of a Visa and a Mastercard, and a cap on each.
3. Charge a merchant. Two caps must sum to the cart, or the whole cart is declined.
4. Close the trip when it is over.

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
