import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

import Colors from "@/constants/colors";
import { ProductsProvider } from "@/hooks/useProducts";

export default function TabLayout() {
  return (
    <ProductsProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          headerShown: false, // Hide header since we have our own
          tabBarStyle: { display: 'none' }, // Hide tab bar since we only have one tab
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "AI Rate List",
            tabBarLabel: "Products",
            tabBarIcon: ({ color }) => <Ionicons name="bar-chart-outline" size={24} color={color} />,
          }}
        />
      </Tabs>
    </ProductsProvider>
  );
}