# Trip wallet

Sign up. Trip Wallet issues a virtual trip card. Start a trip. Put your real card and up to five friends' cards under it.

Merchants charge that one virtual trip card for the full amount. Under it, every person's credit or debit card is charged an equal share. Nobody fronts the trip and waits to be paid back. If anyone cannot cover their share, the whole cart is declined.

## Use

1. Sign up or log in. The app makes a virtual trip card for you. You do not type that number in.
2. Start a trip: a name, your real debit or credit card, then friends with the **+**. Each friend brings their own card.
3. Pay a merchant. The virtual trip card takes the full amount, then every real card under it pays an equal share.
4. Close the trip when it is over.

Live bank rails and a real Apple Pay merchant ID are not connected yet. The trip still records the charge on the phone.

## Build the iPhone app

This is an iOS app. Do not use Expo Go, a QR code, or a website host.

On a Mac with Xcode installed:

```bash
cd iOS-trip
git checkout cursor/ios-trip-wallet-7340
npm install
npm run ios:release
```
