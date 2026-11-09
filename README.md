# Trip wallet

Sign up. Trip Wallet issues a 16-digit virtual trip card. Add it to Apple Wallet. Start a trip. Put your real 16-digit card and up to five friends' cards under it.

Merchants charge that one virtual trip card for the full amount. Under it, every person's credit or debit card is charged an equal share. Nobody fronts the trip and waits to be paid back. If anyone cannot cover their share, the whole cart is declined.

## Use

1. Sign up or log in. The app makes a 16-digit virtual trip card (PAN, expiry, CVV). Add it to Apple Wallet.
2. Start a trip: a name, your full debit or credit number, then friends with the **+**. Each friend brings a full card number.
3. Pay a merchant. The virtual trip card takes the full amount, then every real card under it pays an equal share.
4. Close the trip when it is over.

A live Apple Wallet payment card needs a bank BIN, a card issuer (for example Stripe Issuing or Marqeta), and Apple in-app provisioning. This app records the card and the Wallet add on the phone. No bank is charged yet.

## Build the iPhone app

This is an iOS app. Do not use Expo Go, a QR code, or a website host.

On a Mac with Xcode installed:

```bash
cd iOS-trip
git checkout cursor/ios-trip-wallet-7340
npm install
npm run ios:release
```
