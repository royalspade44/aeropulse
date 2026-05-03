// MyStyleSheet.jsx
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF6FF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1E88E5",
    textAlign: "center",
  },

  input: {
    width: "100%",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    marginVertical: 4,
    fontSize: 16,
  },

  button: {
    width: "100%",
    backgroundColor: "#1E88E5",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 5,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },

  link: {
    color: "#1E88E5",
    marginTop: 10,
    fontSize: 14,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#FFF",
    width: "100%",
    padding: 15,
    borderRadius: 15,
    marginVertical: 8,
    elevation: 3,
    // Added shadow for iOS to match Android elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  productImage: {
    width: "100%",
    height: 140,
    resizeMode: "contain",
  },

  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#FFF",
    alignItems: "center",
  },

  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#DDD",
  },

  menuText: {
    fontSize: 16,
    textAlign: "left",
  },

  errorText: {
    color: 'red',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
    marginLeft: 5,
  },

  // ================= NEW QUICK ACTION STYLES =================
  profileActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 15,
    marginVertical: 6,
    elevation: 2,
  },

  actionIcon: {
    width: 45,
    height: 45,
    marginRight: 15,
    resizeMode: "contain",
  },

  actionContent: {
    flex: 1,
  },

  actionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  actionSubtext: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },

  actionChevron: {
    fontSize: 18,
    color: "#BBBBBB",
    marginLeft: 10,
  },

  // ================= HOME SCREEN STYLES =================
  // Header
  header: {
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  headerLogo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E88E5",
    letterSpacing: 1,
    textShadowColor: "rgba(30, 136, 229, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  headerIconContainer: {
    flexDirection: "row",
    gap: 12,
  },

  headerIcon: {
    padding: 5,
  },

  // Search Bar
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },

  searchWrapper: {
    backgroundColor: "#FFF",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    elevation: 6,
    shadowColor: "#1E88E5",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

  searchInput: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
  },

  searchButton: {
    backgroundColor: "#1E88E5",
    borderRadius: 25,
    padding: 10,
    marginRight: 5,
    elevation: 3,
    shadowColor: "#1E88E5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },

  searchIcon: {
    width: 18,
    height: 18,
  },

  // Featured Product Card
  featuredContainer: {
    paddingHorizontal: 15,
    marginTop: 5,
  },

  featuredCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 18,
    elevation: 12,
    shadowColor: "#1E88E5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    position: "relative",
  },

  reflectionEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 1,
  },

  featuredImageContainer: {
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#F8F9FA",
    position: "relative",
  },

  innerShadow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    zIndex: 1,
  },

  featuredImage: {
    width: "100%",
    height: 180,
    resizeMode: "contain",
  },

  featuredTitle: {
    textAlign: "center",
    marginTop: 12,
    fontWeight: "bold",
    fontSize: 16,
    color: "#1E88E5",
    textShadowColor: "rgba(30, 136, 229, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  featuredSubtext: {
    textAlign: "center",
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  // Brands Section
  brandsContainer: {
    paddingHorizontal: 15,
    marginTop: 20,
    marginBottom: 25,
  },

  brandsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
  },

  brandsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E88E5",
    textShadowColor: "rgba(30, 136, 229, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  seeAllLink: {
    fontSize: 12,
    color: "#1E88E5",
    fontWeight: "500",
  },

  brandGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  brandCard: {
    width: "30%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 15,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1.5,
    borderColor: "#1E88E5",
    position: "relative",
  },

  brandReflection: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 35,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 1,
  },

  brandLogoCircle: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#1E88E5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  brandLogo: {
    width: 45,
    height: 45,
    resizeMode: "contain",
  },

  brandName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E88E5",
    textShadowColor: "rgba(30, 136, 229, 0.2)",
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
  },

  bottomSpacer: {
    height: 10,
  },
});