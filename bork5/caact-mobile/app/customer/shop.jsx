import { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, Alert } from "react-native";
import CustomerScreen from "../../components/customer/CustomerScreen";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { COLORS, SPACING, FONT } from "../../constants/theme";
import * as api from "../../services/api";
import { useUserContext } from "../../context/UserContext";

export default function CustomerShopScreen() {
  const { token, current } = useUserContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get("/products/public")
      .then((res) => {
        if (!active) return;
        const items = Array.isArray(res.data.products)
          ? res.data.products.map((p) => ({
              ...p,
              inStock: Number(p.stock) > 0,
              imageUrl: p.imageUrl || p.image || "",
            }))
          : [];
        setProducts(items);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const handleAddToCart = (product) => {
    if (!current || !token) {
      Alert.alert("Login required", "Please log in to add items to your cart.");
      return;
    }
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleCheckout = async () => {
    if (!current || !token) {
      Alert.alert("Login required", "Please log in to checkout.");
      return;
    }
    if (cart.length === 0) {
      Alert.alert("Cart is empty", "Add items to your cart before checking out.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        items: cart.map((item) => ({
          id: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          specs: item.specs,
        })),
        // Address selection can be improved; here we use the default or first address
        addressId: current.addresses?.[0]?._id || current.addresses?.[0]?.id || "",
        paymentMethod: "cod",
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      };
      const { ok, data } = await api.post("/orders", payload, token);
      if (ok && data?.order) {
        Alert.alert("Order placed!", "Your order has been submitted and is pending approval.");
        setCart([]);
      } else {
        Alert.alert("Order failed", data?.message || "Could not place order.");
      }
    } catch (e) {
      Alert.alert("Order failed", "Could not place order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomerScreen title="Shop" subtitle="Browse and buy AC units">
      {loading ? (
        <Text style={{ textAlign: "center", marginTop: SPACING.lg }}>Loading products...</Text>
      ) : (
        <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
          {products.map((product) => (
            <Card key={product.id || product._id} style={{ marginBottom: SPACING.md }}>
              <View style={{ flexDirection: "row", gap: SPACING.md }}>
                <Image source={{ uri: product.imageUrl }} style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: COLORS.border }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: FONT.bold, fontSize: FONT.base }}>{product.name}</Text>
                  <Text style={{ color: COLORS.textSecondary, marginTop: 2 }}>{product.brand} • {product.specs}</Text>
                  <Text style={{ color: COLORS.primary, fontWeight: FONT.bold, marginTop: 4 }}>₱{product.price?.toLocaleString?.() ?? product.price}</Text>
                  <Text style={{ color: COLORS.textSecondary, marginTop: 2 }}>{product.description}</Text>
                  <Button
                    title={product.inStock ? "Add to Cart" : "Out of Stock"}
                    disabled={!product.inStock}
                    style={{ marginTop: SPACING.sm }}
                    onPress={() => handleAddToCart(product)}
                  />
                </View>
              </View>
            </Card>
          ))}
          {cart.length > 0 && (
            <Card style={{ marginTop: SPACING.lg }}>
              <Text style={{ fontWeight: FONT.bold, fontSize: FONT.base, marginBottom: SPACING.sm }}>Cart</Text>
              {cart.map((item) => (
                <View key={item.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: SPACING.sm }}>
                  <Text>{item.name} x{item.quantity}</Text>
                  <Text>₱{(item.price * item.quantity).toLocaleString()}</Text>
                </View>
              ))}
              <Button
                title={submitting ? "Placing Order..." : "Checkout"}
                disabled={submitting}
                style={{ marginTop: SPACING.md }}
                onPress={handleCheckout}
              />
            </Card>
          )}
        </ScrollView>
      )}
    </CustomerScreen>
  );
}
