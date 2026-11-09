import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatDollars, type Charge, type Person } from "@/ledger";
import { colors } from "@/components/ui";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

const faceColors = ["#C9B6A3", "#8EAF7A", "#A9D4C2", "#E8A0A0", "#8FA4D4", "#D4B48F"];

function faceColor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash + char.charCodeAt(0)) % faceColors.length;
  return faceColors[hash] ?? faceColors[0];
}

export function WalletHeader({ onHelp, onSettings }: { onHelp: () => void; onSettings: () => void }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerSide} />
      <Text style={styles.title}>Wallet</Text>
      <View style={styles.headerTools}>
        <Pressable accessibilityRole="button" accessibilityLabel="How it works" onPress={onHelp} style={styles.tool}>
          <View style={styles.helpCircle}>
            <Text style={styles.helpMark}>?</Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log out"
          testID="log-out"
          onPress={onSettings}
          style={styles.tool}
        >
          <View style={styles.gear} />
        </Pressable>
      </View>
    </View>
  );
}

export function BalanceHero({
  cents,
  caption,
}: {
  cents: number;
  caption: string;
}) {
  return (
    <View style={styles.hero}>
      <Text style={styles.totalLabel}>Total left</Text>
      <Text style={styles.total}>{formatDollars(cents)}</Text>
      <Text style={styles.safe}>{caption}</Text>
    </View>
  );
}

export function ActionRow({
  tripOpen,
  onCharge,
  onInvite,
  onWallet,
  onStart,
}: {
  tripOpen: boolean;
  onCharge: () => void;
  onInvite: () => void;
  onWallet: () => void;
  onStart: () => void;
}) {
  return (
    <View style={styles.actions}>
      <Action
        label="Charge"
        testID={tripOpen ? "new-charge" : undefined}
        onPress={onCharge}
        icon={<ChargeIcon />}
      />
      <Action label="Invite" onPress={onInvite} icon={<InviteIcon />} />
      <Action label="Card" onPress={onWallet} icon={<WalletIcon />} />
      <Action label="Start" testID="start-trip" onPress={onStart} icon={<StartIcon />} />
    </View>
  );
}

function Action({
  label,
  icon,
  onPress,
  testID,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}
    >
      <View style={styles.actionIcon}>{icon}</View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function ChargeIcon() {
  return (
    <View style={styles.iconBox}>
      <View style={styles.cardMini} />
      <View style={styles.arrowDown} />
    </View>
  );
}

function InviteIcon() {
  return (
    <View style={styles.iconBox}>
      <View style={styles.personHead} />
      <View style={styles.personBody} />
    </View>
  );
}

function WalletIcon() {
  return (
    <View style={styles.iconBox}>
      <View style={styles.walletBody} />
      <View style={styles.walletSlot} />
    </View>
  );
}

function StartIcon() {
  return (
    <View style={styles.iconBox}>
      <View style={styles.plusH} />
      <View style={styles.plusV} />
    </View>
  );
}

export function InsightTiles({
  leftoverCents,
  spentCents,
  charges,
}: {
  leftoverCents: number;
  spentCents: number;
  charges: Charge[];
}) {
  const recent = [...charges].reverse().slice(0, 2);
  return (
    <View style={styles.tiles}>
      <View style={styles.tile}>
        <Text style={styles.tileTitle}>Left</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>On cards</Text>
          <Text style={styles.statValue}>{formatDollars(leftoverCents)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Spent</Text>
          <Text style={styles.statGreen}>{formatDollars(spentCents)}</Text>
        </View>
      </View>
      <View style={styles.tile}>
        <Text style={styles.tileTitle}>Charges</Text>
        {recent.length === 0 ? (
          <Text style={styles.emptyActivity}>No charges yet</Text>
        ) : (
          recent.map((charge) => (
            <View key={charge.id} style={styles.activityRow}>
              <View style={[styles.tinyFace, { backgroundColor: faceColor(charge.merchant) }]}>
                <Text style={styles.tinyFaceText}>{initials(charge.merchant)}</Text>
              </View>
              <Text style={styles.activityName} numberOfLines={1}>
                {charge.merchant}
              </Text>
              <Text style={styles.activityAmt}>
                {formatDollars(charge.collections[0]?.amountCents ?? charge.amountCents)}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

export function PromoCard({
  inWallet,
  hasTrip,
  onPress,
}: {
  inWallet: boolean;
  hasTrip: boolean;
  onPress: () => void;
}) {
  const title = !hasTrip ? "Start a trip" : inWallet ? "Invite friends" : "Add to Apple Wallet";
  const body = !hasTrip
    ? "Friends put real cards under the trip card."
    : inWallet
      ? "Each card pays an equal share. Nobody is owed later."
      : "Shops charge this trip card, then everyone splits.";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.promo, pressed && styles.pressed]}
    >
      <View style={styles.promoIcon}>
        <View style={styles.promoMark} />
      </View>
      <View style={styles.promoCopy}>
        <Text style={styles.promoTitle}>{title}</Text>
        <Text style={styles.promoBody}>{body}</Text>
      </View>
    </Pressable>
  );
}

export function PersonTiles({
  owner,
  extra,
  onOwner,
  onExtra,
}: {
  owner: { name: string; remainingCents: number } | null;
  extra: { name: string; remainingCents: number } | null;
  onOwner: () => void;
  onExtra: () => void;
}) {
  return (
    <View style={styles.people}>
      <PersonTile
        name={owner?.name ?? "You"}
        cents={owner?.remainingCents ?? 0}
        onPress={onOwner}
      />
      <PersonTile
        name={extra?.name ?? "Friends"}
        cents={extra?.remainingCents ?? 0}
        onPress={onExtra}
      />
    </View>
  );
}

function PersonTile({
  name,
  cents,
  onPress,
}: {
  name: string;
  cents: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name} ${formatDollars(cents)}`}
      onPress={onPress}
      style={({ pressed }) => [styles.personTile, pressed && styles.pressed]}
    >
      <View style={styles.personHeadRow}>
        <View style={[styles.face, { backgroundColor: faceColor(name) }]}>
          <Text style={styles.faceText}>{initials(name)}</Text>
        </View>
        <Text style={styles.personName} numberOfLines={1}>
          {name}
        </Text>
      </View>
      <Text style={styles.splitLabel}>Equal split</Text>
      <Text style={styles.personAmt}>{formatDollars(cents)}</Text>
    </Pressable>
  );
}

export function peopleFromTrip(people: Person[], ownerName: string) {
  const owner = people[0] ?? { name: ownerName, card: { remainingCents: 0 } };
  const rest = people.slice(1);
  const extra =
    rest.length === 1
      ? { name: rest[0]!.name, remainingCents: rest[0]!.card.remainingCents }
      : rest.length > 1
        ? {
            name: "Friends",
            remainingCents: rest.reduce((sum, person) => sum + person.card.remainingCents, 0),
          }
        : { name: "Friends", remainingCents: 0 };
  return {
    owner: { name: owner.name, remainingCents: owner.card.remainingCents },
    extra,
  };
}

const styles = StyleSheet.create({
  header: {
    minHeight: 44,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  headerSide: {
    width: 72,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: colors.ink,
  },
  headerTools: {
    width: 72,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  tool: {
    width: 36,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  helpCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.6,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  helpMark: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  gear: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.6,
    borderColor: colors.ink,
  },
  hero: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 14,
  },
  totalLabel: {
    fontSize: 13,
    color: colors.gray,
  },
  total: {
    marginTop: 2,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: "700",
    letterSpacing: -1.4,
    color: colors.ink,
  },
  safe: {
    marginTop: 6,
    fontSize: 13,
    color: colors.gray,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  action: {
    flex: 1,
    minHeight: 76,
    borderRadius: 18,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  actionIcon: {
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  iconBox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cardMini: {
    width: 18,
    height: 12,
    borderRadius: 3,
    borderWidth: 1.6,
    borderColor: colors.ink,
  },
  arrowDown: {
    width: 0,
    height: 0,
    marginTop: 2,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 5,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: colors.ink,
  },
  personHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.6,
    borderColor: colors.ink,
  },
  personBody: {
    width: 14,
    height: 8,
    marginTop: 2,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderWidth: 1.6,
    borderBottomWidth: 0,
    borderColor: colors.ink,
  },
  walletBody: {
    width: 18,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.6,
    borderColor: colors.ink,
  },
  walletSlot: {
    position: "absolute",
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.4,
    borderColor: colors.ink,
  },
  plusH: {
    width: 14,
    height: 2,
    backgroundColor: colors.ink,
    borderRadius: 1,
  },
  plusV: {
    position: "absolute",
    width: 2,
    height: 14,
    backgroundColor: colors.ink,
    borderRadius: 1,
  },
  tiles: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
  },
  tile: {
    flex: 1,
    minHeight: 108,
    borderRadius: 18,
    backgroundColor: colors.cream,
    padding: 12,
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 13,
    color: colors.gray,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
  statGreen: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.green,
  },
  emptyActivity: {
    marginTop: 8,
    fontSize: 13,
    color: colors.gray,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  tinyFace: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  tinyFaceText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#111",
  },
  activityName: {
    flex: 1,
    fontSize: 12,
    color: colors.ink,
  },
  activityAmt: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.ink,
  },
  promo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 64,
    borderRadius: 18,
    backgroundColor: colors.cream,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  promoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  promoMark: {
    width: 14,
    height: 10,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  promoCopy: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  promoBody: {
    marginTop: 2,
    fontSize: 13,
    color: colors.gray,
  },
  people: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
  },
  personTile: {
    flex: 1,
    minHeight: 118,
    borderRadius: 18,
    backgroundColor: colors.cream,
    padding: 12,
  },
  personHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  face: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  faceText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#111",
  },
  personName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
  },
  splitLabel: {
    marginTop: 18,
    fontSize: 13,
    fontWeight: "600",
    color: colors.green,
  },
  personAmt: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.6,
    color: colors.ink,
  },
});
