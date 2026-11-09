import { useState, type ReactNode } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { formatDollars, formatPan, type IssuedCard, type Person } from "@/ledger";
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

function CardEtching() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={etch.arc} />
      <View style={etch.arcInner} />
      <View style={[etch.line, { right: 92, top: -24, transform: [{ rotate: "18deg" }] }]} />
      <View style={[etch.line, { right: 64, top: -36, height: 220, transform: [{ rotate: "22deg" }] }]} />
      <View style={[etch.dash, { right: 118, top: 18, transform: [{ rotate: "16deg" }] }]} />
      <View style={[etch.dash, { right: 48, top: 72, transform: [{ rotate: "28deg" }] }]} />
    </View>
  );
}

export function VirtualCard({
  card,
  revealed,
  onToggleDetails,
}: {
  card: IssuedCard;
  revealed: boolean;
  onToggleDetails: () => void;
}) {
  return (
    <View style={styles.card}>
      <CardEtching />
      <View style={styles.virtualBadge}>
        <Text style={styles.virtualBadgeText}>Virtual</Text>
      </View>
      <View style={styles.cardBottom}>
        <View style={styles.cardMeta}>
          <Text style={styles.cardName}>
            {revealed ? formatPan(card.pan) : `Virtual Card *${card.last4}`}
          </Text>
          {revealed ? (
            <Text style={styles.cardSecret}>
              exp {card.exp} · cvv {card.cvv}
            </Text>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={revealed ? "Hide details" : "View details"}
          testID="view-details"
          onPress={onToggleDetails}
          style={styles.detailsPill}
        >
          <View style={styles.eye}>
            <View style={styles.eyeDot} />
          </View>
          <Text style={styles.detailsText}>{revealed ? "Hide" : "View details"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function CardCarousel({
  card,
  revealed,
  onToggleDetails,
}: {
  card: IssuedCard;
  revealed: boolean;
  onToggleDetails: () => void;
}) {
  return (
    <View style={styles.carousel}>
      <View style={styles.carouselMain}>
        <VirtualCard card={card} revealed={revealed} onToggleDetails={onToggleDetails} />
      </View>
      <View style={styles.peek} />
    </View>
  );
}

export function PersonPicker({
  people,
  selected,
  onSelect,
  onManage,
}: {
  people: Person[];
  selected: Person | undefined;
  onSelect: (person: Person) => void;
  onManage: () => void;
}) {
  const [open, setOpen] = useState(false);
  if (!selected) return null;
  return (
    <View style={styles.pickerWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${selected.name}, change person`}
        testID="person-picker"
        onPress={() => setOpen((value) => !value)}
        style={styles.picker}
      >
        <View style={[styles.avatar, { backgroundColor: faceColor(selected.name) }]}>
          <Text style={styles.avatarText}>{initials(selected.name)}</Text>
        </View>
        <Text style={styles.pickerName}>{selected.name}</Text>
        <Text style={styles.chevron}>{open ? "⌃" : "⌄"}</Text>
      </Pressable>
      {open
        ? people.map((person) => (
            <Pressable
              key={person.id}
              accessibilityRole="button"
              accessibilityLabel={person.name}
              onPress={() => {
                onSelect(person);
                setOpen(false);
              }}
              style={styles.pickerItem}
            >
              <View style={[styles.avatar, { backgroundColor: faceColor(person.name) }]}>
                <Text style={styles.avatarText}>{initials(person.name)}</Text>
              </View>
              <Text style={styles.pickerName}>{person.name}</Text>
            </Pressable>
          ))
        : null}
      {open ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share trip"
          testID="open-share"
          onPress={() => {
            setOpen(false);
            onManage();
          }}
          style={styles.pickerItem}
        >
          <Text style={styles.pickerAction}>Add friends</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ManageButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Manage card"
      testID="manage-card"
      onPress={onPress}
      style={({ pressed }) => [styles.manage, pressed && styles.managePressed]}
    >
      <Text style={styles.manageText}>Manage Card</Text>
    </Pressable>
  );
}

export function StatTiles({
  leftoverCents,
  spentCents,
  place,
}: {
  leftoverCents: number;
  spentCents: number;
  place: string;
}) {
  return (
    <View style={styles.tiles}>
      <View style={styles.tile}>
        <Text style={styles.tileTitle}>Cashback</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Lifetime</Text>
          <Text style={styles.statValue}>{formatDollars(leftoverCents)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>This week</Text>
          <Text style={styles.statBlue}>{formatDollars(spentCents)}</Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open map for ${place}`}
        onPress={() => Linking.openURL(`https://maps.apple.com/?q=${encodeURIComponent(place)}`)}
        style={styles.tile}
      >
        <Text style={styles.tileTitle}>Find ATMs</Text>
        <View style={styles.mapPreview}>
          <View style={[styles.mapRoad, styles.mapRoadA]} />
          <View style={[styles.mapRoad, styles.mapRoadB]} />
          <View style={[styles.mapRoad, styles.mapRoadC]} />
          <View style={styles.pin} />
        </View>
      </Pressable>
    </View>
  );
}

export function ChargeRow({
  merchant,
  amountCents,
  shareCents,
  onPress,
}: {
  merchant: string;
  amountCents: number;
  shareCents: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${merchant} ${formatDollars(amountCents)}`}
      onPress={onPress}
      style={styles.charge}
    >
      <View style={styles.chargeIcon}>
        <View style={styles.bagHandle} />
        <View style={styles.bag} />
      </View>
      <View style={styles.chargeCopy}>
        <Text style={styles.merchant}>{merchant}</Text>
        <Text style={styles.kind}>{categoryFor(merchant)}</Text>
      </View>
      <View style={styles.chargeAmounts}>
        <Text style={styles.amount}>{formatDollars(amountCents)}</Text>
        <Text style={styles.share}>{formatDollars(shareCents)}</Text>
      </View>
    </Pressable>
  );
}

function categoryFor(merchant: string) {
  const name = merchant.toLowerCase();
  if (/(fico|camper|cafe|food|drink|dash|restaurant|bar|grill)/.test(name)) return "Food And Drink";
  if (/(hotel|airbnb|inn|lodge)/.test(name)) return "Travel";
  return "Equal split";
}

function TabIcon({ children, active, badge }: { children: ReactNode; active?: boolean; badge?: string }) {
  return (
    <View style={styles.tabIconWrap}>
      {children}
      {active ? <View style={styles.homeDot} /> : <View style={styles.tabSpacer} />}
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function TabBar({
  onHome,
  onSearch,
  onPay,
  onAlerts,
  onChat,
}: {
  onHome: () => void;
  onSearch: () => void;
  onPay: () => void;
  onAlerts: () => void;
  onChat: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Home" onPress={onHome} style={styles.tab}>
        <TabIcon active>
          <View style={styles.homeIcon}>
            <View style={styles.homeRoof} />
            <View style={styles.homeBody} />
          </View>
        </TabIcon>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Search trips" onPress={onSearch} style={styles.tab}>
        <TabIcon>
          <View style={styles.searchIcon}>
            <View style={styles.searchCircle} />
            <View style={styles.searchHandle} />
          </View>
        </TabIcon>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="New charge"
        testID="new-charge"
        onPress={onPay}
        style={styles.tab}
      >
        <TabIcon>
          <View style={styles.compass}>
            <View style={styles.compassRing} />
            <View style={styles.compassNeedle} />
          </View>
        </TabIcon>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Alerts" onPress={onAlerts} style={styles.tab}>
        <TabIcon badge="2">
          <View style={styles.bellBody} />
        </TabIcon>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Share trip" onPress={onChat} style={styles.tab}>
        <TabIcon>
          <View style={styles.bubble} />
          <View style={styles.bubbleTail} />
        </TabIcon>
      </Pressable>
    </View>
  );
}

const etch = StyleSheet.create({
  arc: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.14)",
    right: -70,
    top: -78,
  },
  arcInner: {
    position: "absolute",
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    right: -28,
    top: -46,
  },
  line: {
    position: "absolute",
    width: 1.2,
    height: 200,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  dash: {
    position: "absolute",
    width: 1,
    height: 56,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});

const styles = StyleSheet.create({
  carousel: {
    flexDirection: "row",
    alignItems: "stretch",
    overflow: "hidden",
  },
  carouselMain: {
    flex: 1,
    marginRight: 12,
  },
  peek: {
    width: 18,
    marginVertical: 14,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    backgroundColor: "#E4E4EA",
  },
  card: {
    minHeight: 196,
    borderRadius: 22,
    backgroundColor: "#161616",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    justifyContent: "space-between",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  virtualBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  virtualBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111",
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
  },
  cardMeta: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    color: "#F5F5F7",
  },
  cardSecret: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(245,245,247,0.7)",
  },
  detailsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(28,28,30,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  eye: {
    width: 14,
    height: 8,
    borderRadius: 7,
    borderWidth: 1.4,
    borderColor: "#F5F5F7",
    alignItems: "center",
    justifyContent: "center",
  },
  eyeDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: "#F5F5F7",
  },
  detailsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F5F5F7",
  },
  pickerWrap: {
    marginTop: -22,
    marginHorizontal: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
  },
  picker: {
    minHeight: 52,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pickerItem: {
    minHeight: 48,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#111",
  },
  pickerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: colors.ink,
  },
  pickerAction: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.blue,
  },
  chevron: {
    fontSize: 16,
    color: colors.gray,
  },
  manage: {
    marginTop: 16,
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  managePressed: {
    transform: [{ scale: 0.985 }],
  },
  manageText: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.ink,
  },
  tiles: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },
  tile: {
    flex: 1,
    minHeight: 118,
    borderRadius: 18,
    backgroundColor: colors.cream,
    padding: 14,
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 10,
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
  statBlue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.blue,
  },
  mapPreview: {
    flex: 1,
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: "#E6E8EA",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  mapRoad: {
    position: "absolute",
    backgroundColor: "#D5D8DC",
  },
  mapRoadA: {
    width: "140%",
    height: 6,
    top: 18,
    left: -12,
    transform: [{ rotate: "12deg" }],
  },
  mapRoadB: {
    width: 6,
    height: "140%",
    left: 36,
    top: -10,
    transform: [{ rotate: "-8deg" }],
  },
  mapRoadC: {
    width: "90%",
    height: 4,
    bottom: 16,
    left: 8,
    transform: [{ rotate: "-16deg" }],
  },
  pin: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.blue,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  charge: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  chargeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  bagHandle: {
    width: 8,
    height: 5,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1.6,
    borderBottomWidth: 0,
    borderColor: colors.ink,
    marginBottom: -1,
  },
  bag: {
    width: 14,
    height: 11,
    borderRadius: 3,
    borderWidth: 1.6,
    borderColor: colors.ink,
  },
  chargeCopy: {
    flex: 1,
  },
  merchant: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.ink,
  },
  kind: {
    marginTop: 2,
    fontSize: 13,
    color: colors.gray,
  },
  chargeAmounts: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.ink,
  },
  share: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "600",
    color: colors.blue,
  },
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 10,
    minHeight: 56,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconWrap: {
    width: 28,
    height: 32,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  tabSpacer: {
    height: 9,
  },
  homeIcon: {
    width: 22,
    height: 20,
    alignItems: "center",
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: colors.ink,
  },
  homeBody: {
    width: 16,
    height: 11,
    backgroundColor: colors.ink,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  homeDot: {
    marginTop: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.blue,
  },
  searchIcon: {
    width: 22,
    height: 22,
  },
  searchCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.8,
    borderColor: colors.ink,
  },
  searchHandle: {
    position: "absolute",
    width: 7,
    height: 1.8,
    backgroundColor: colors.ink,
    right: 2,
    bottom: 5,
    transform: [{ rotate: "40deg" }],
  },
  compass: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  compassRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: colors.ink,
  },
  compassNeedle: {
    position: "absolute",
    width: 6,
    height: 6,
    backgroundColor: colors.ink,
    transform: [{ rotate: "45deg" }],
  },
  bellBody: {
    width: 16,
    height: 15,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    borderWidth: 1.8,
    borderColor: colors.ink,
    marginTop: 2,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  bubble: {
    width: 20,
    height: 15,
    borderRadius: 8,
    borderWidth: 1.8,
    borderColor: colors.ink,
    marginTop: 2,
  },
  bubbleTail: {
    width: 6,
    height: 6,
    borderLeftWidth: 1.8,
    borderBottomWidth: 1.8,
    borderColor: colors.ink,
    marginTop: -3,
    marginLeft: -8,
    transform: [{ rotate: "20deg" }],
  },
});
