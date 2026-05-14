import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import CustomerScreen from "../../components/customer/CustomerScreen";
import CustomerSectionHeader from "../../components/customer/CustomerSectionHeader";
import Card from "../../components/ui/Card";
import { SPACING, COLORS, FONT } from "../../constants/theme";

const FAQS = [
  {
    question: "How do I place an order?",
    answer: "Browse products, add to cart, and proceed to checkout. You will need to log in or create an account to complete your purchase.",
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept major credit cards, GCash, and bank transfer.",
  },
  {
    question: "How can I track my order?",
    answer: "Go to the Orders page in the app to view your order status and details.",
  },
  {
    question: "How do I contact support?",
    answer: "Visit the Contact page for support email, hotline, and Messenger details.",
  },
];

export default function CustomerFAQScreen() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <CustomerScreen title="FAQs" subtitle="Frequently Asked Questions">
      <Card>
        <CustomerSectionHeader title="FAQs" />
        <ScrollView>
          {FAQS.map((faq, idx) => (
            <View key={faq.question} style={{ marginBottom: SPACING.md }}>
              <TouchableOpacity
                onPress={() => setOpenIndex(openIndex === idx ? null : idx)}
                style={{
                  paddingVertical: SPACING.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.border,
                }}
              >
                <Text style={{ fontWeight: FONT.bold, fontSize: FONT.base, color: COLORS.textPrimary }}>
                  {faq.question}
                </Text>
              </TouchableOpacity>
              {openIndex === idx && (
                <Text style={{ marginTop: SPACING.sm, color: COLORS.textSecondary, fontSize: FONT.base }}>
                  {faq.answer}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      </Card>
    </CustomerScreen>
  );
}
