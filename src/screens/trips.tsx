import { router } from "expo-router";
import { Alert, StyleSheet, View } from "react-native";

import { CardPeek, TabBar } from "@/components/card-home";
import { Screen } from "@/components/ui";
import {
  ActionRow,
  BalanceHero,
  InsightTiles,
  peopleFromTrip,
  PersonTiles,
  PromoCard,
  WalletHeader,
} from "@/components/wallet-home";
import { leftCents, spentCents, type Trip } from "@/ledger";
import { useTrip } from "@/store";

export function TripsScreen() {
  const { trip, notice, user, logOut, beginCharge, addToWallet } = useTrip();
  const open = trip?.status === "open";
  const leftover = trip ? leftCents(trip) : 0;
  const spent = trip ? spentCents(trip) : 0;
  const card = trip?.card ?? user?.tripCard;
  const people = peopleFromTrip(trip?.people ?? [], user?.name ?? "You");

  function goCharge() {
    if (open) {
      beginCharge();
      router.push("/caps");
      return;
    }
    router.push("/start");
  }

  function goInvite() {
    if (trip) {
      router.push("/share");
      return;
    }
    router.push("/start");
  }

  function goWallet() {
    if (user?.tripCard && !user.tripCard.inWallet) {
      addToWallet();
      return;
    }
    if (open) {
      router.push("/trip");
      return;
    }
    router.push("/start");
  }

  function openCard() {
    if (!trip) {
      router.push("/start");
      return;
    }
    router.push(open ? "/trip" : "/closed");
  }

  function howItWorks() {
    Alert.alert(
      "Trip Wallet",
      "Shops charge one virtual trip card. You plus up to five friends each put a real card under it. Every spend splits equally.",
    );
  }

  return (
    <Screen
      flushFooter
      header={<WalletHeader onHelp={howItWorks} onSettings={logOut} />}
      footer={
        <TabBar
          onHome={() => {}}
          onSearch={() => {}}
          onPay={goCharge}
          onAlerts={goInvite}
          onChat={goInvite}
          payTestID={null}
        />
      }
    >
      <BalanceHero
        cents={leftover}
        caption={notice ?? "Everyone pays the same share."}
      />
      <ActionRow
        tripOpen={open}
        onCharge={goCharge}
        onInvite={goInvite}
        onWallet={goWallet}
        onStart={() => router.push("/start")}
      />
      <InsightTiles leftoverCents={leftover} spentCents={spent} charges={trip?.charges ?? []} />
      {card ? (
        <CardPeek
          card={card}
          testID="trip-row"
          onPress={openCard}
        />
      ) : null}
      <View style={styles.sheet}>
        <PromoCard
          hasTrip={Boolean(trip)}
          inWallet={Boolean(user?.tripCard?.inWallet || trip?.card.inWallet)}
          onPress={
            !trip ? () => router.push("/start") : user?.tripCard?.inWallet ? goInvite : goWallet
          }
        />
        <PersonTiles
          owner={people.owner}
          extra={people.extra}
          onOwner={openCard}
          onExtra={goInvite}
        />
      </View>
    </Screen>
  );
}

export function TripStack({ trip }: { trip: Trip }) {
  return (
    <CardPeek
      card={trip.card}
      onPress={() => router.push(trip.status === "open" ? "/trip" : "/closed")}
    />
  );
}

const styles = StyleSheet.create({
  sheet: {
    marginTop: -28,
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingTop: 8,
  },
});
