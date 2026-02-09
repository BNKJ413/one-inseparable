import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, Text, View, Button, TextInput } from "react-native";

const API = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function App() {
  const [coupleId, setCoupleId] = useState("");
  const [anchor, setAnchor] = useState(null);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("");
    try {
      const res = await fetch(`${API}/api/anchors/today?coupleId=${encodeURIComponent(coupleId)}`);
      const json = await res.json();
      setAnchor(json.anchor);
    } catch (e) {
      setMsg(String(e));
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 18 }}>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>One</Text>
      <Text style={{ marginBottom: 14, opacity: 0.7 }}>Inseparable</Text>

      <View style={{ marginBottom: 12 }}>
        <Text style={{ marginBottom: 6, opacity: 0.7 }}>Couple ID</Text>
        <TextInput value={coupleId} onChangeText={setCoupleId} style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10 }} />
        <View style={{ height: 10 }} />
        <Button title="Load Today Anchor" onPress={load} />
      </View>

      <View style={{ padding: 14, backgroundColor: "#f6f4ef", borderRadius: 14 }}>
        <Text style={{ opacity: 0.7 }}>Today’s Anchor</Text>
        {anchor ? (
          <>
            <Text style={{ fontSize: 16, fontWeight: "600", marginTop: 8 }}>
              {anchor.scripture ? anchor.scripture.reference : "Today"}
            </Text>
            <Text style={{ marginTop: 6, opacity: 0.8 }}>
              {anchor.scripture ? anchor.scripture.marriageMeaning : anchor.principleText}
            </Text>
          </>
        ) : (
          <Text style={{ marginTop: 8, opacity: 0.7 }}>Enter a coupleId and load.</Text>
        )}
      </View>

      <Text style={{ marginTop: 12, opacity: 0.7 }}>{msg}</Text>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
