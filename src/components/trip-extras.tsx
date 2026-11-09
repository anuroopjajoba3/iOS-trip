import { Image } from "expo-image";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { formatDollars, maxPeople, spentCents, type Person, type Photo, type Trip } from "@/ledger";
import { colors } from "@/components/ui";

const faceColors = ["#F0C24B", "#8EAF7A", "#A9D4C2", "#E8A0A0", "#8FA4D4", "#D4B48F"];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

function faceColor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash + char.charCodeAt(0)) % faceColors.length;
  return faceColors[hash] ?? faceColors[0];
}

export function FaceRow({
  people,
  onPress,
}: {
  people: Person[];
  onPress?: () => void;
}) {
  const inner = (
    <View style={styles.faces}>
      {people.length === 0 ? (
        <View style={[styles.face, { backgroundColor: colors.field }]}>
          <Text style={styles.facePlus}>+</Text>
        </View>
      ) : (
        people.slice(0, maxPeople).map((person) => (
          <View key={person.id} style={[styles.face, { backgroundColor: faceColor(person.name) }]}>
            <Text style={styles.faceText}>{initials(person.name)}</Text>
          </View>
        ))
      )}
      <Text style={styles.faceLabel}>{people.length === 0 ? "Invite" : `${people.length} going`}</Text>
    </View>
  );
  if (!onPress) return inner;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Share trip" onPress={onPress} testID="open-share">
      {inner}
    </Pressable>
  );
}

export function SpentChart({ trip }: { trip: Trip }) {
  const spent = spentCents(trip);
  const left = Math.max(trip.budgetCents - spent, 0);
  const max = Math.max(trip.budgetCents, 1);
  return (
    <View style={styles.chart}>
      <Text style={styles.section}>Spend</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(100, (spent / max) * 100)}%`, backgroundColor: "#8567FF" }]} />
      </View>
      <Text style={styles.meta}>
        {formatDollars(spent)} spent · {formatDollars(left)} left
      </Text>
    </View>
  );
}

export function PlaceMap({ place }: { place: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open map for ${place}`}
      onPress={() => Linking.openURL(`https://maps.apple.com/?q=${encodeURIComponent(place)}`)}
      style={styles.map}
    >
      <View style={styles.pin} />
      <Text style={styles.mapTitle}>{place}</Text>
      <Text style={styles.meta}>Open map</Text>
    </Pressable>
  );
}

export function PhotoStrip({
  photos,
  onAdd,
}: {
  photos: Photo[];
  onAdd: () => void;
}) {
  return (
    <View>
      <View style={styles.photoHead}>
        <Text style={styles.section}>Photos</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Add photo" onPress={onAdd} style={styles.textAction}>
          <Text style={styles.textActionLabel}>Add</Text>
        </Pressable>
      </View>
      {photos.length === 0 ? <Text style={styles.meta}>No photos yet.</Text> : null}
      <View style={styles.photos}>
        {photos.map((photo) => (
          <Image key={photo.id} source={{ uri: photo.uri }} style={styles.photo} contentFit="cover" />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  faces: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    marginTop: 8,
  },
  face: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  faceText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  facePlus: {
    fontSize: 18,
    color: colors.white,
  },
  faceLabel: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.gray,
  },
  chart: {
    marginTop: 18,
  },
  section: {
    marginBottom: 8,
    fontSize: 13,
    lineHeight: 16,
    color: colors.gray,
  },
  track: {
    height: 7,
    borderRadius: 6,
    backgroundColor: colors.line,
    overflow: "hidden",
  },
  fill: {
    height: 10,
    borderRadius: 6,
  },
  meta: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: colors.gray,
  },
  legend: {
    marginTop: 4,
  },
  map: {
    marginTop: 18,
    minHeight: 120,
    borderRadius: 22,
    backgroundColor: "#EEF0F2",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  pin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.blue,
    marginBottom: 8,
  },
  mapTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "700",
    color: colors.white,
  },
  photoHead: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textAction: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  textActionLabel: {
    fontSize: 16,
    color: colors.gray,
  },
  photos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 14,
    backgroundColor: colors.field,
  },
});
