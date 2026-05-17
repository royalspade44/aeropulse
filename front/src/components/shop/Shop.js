import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../../config/api";
import { useCart } from "../../context/CartContext";
import { useUser } from "../../context/UserContext";
import {
  deduplicateProducts,
  mergeProductLists,
} from "../../utils/productDeduplication";
import ProductModal from "./ProductModal";

// Modular Boutique Components
import BoutiqueCart from "../common/boutique/BoutiqueCart";
import BoutiqueFooter from "../common/boutique/BoutiqueFooter";
import BoutiqueHeader from "../common/boutique/BoutiqueHeader";
import { BQ_COLORS, BQ_GEOMETRY } from "../common/boutique/BoutiqueTheme";
import ShopCatalogue from "./ShopCatalogue";
import ShopSidebar from "./ShopSidebar";

const fallbackProducts = [
  {
    id: 1,
    name: "American Home Inverter AC 1.0HP",
    brand: "American Home",
    category: "split",
    price: 18499,
    oldPrice: 20999,
    specs: "1.0HP",
    model: "AHAC-MINV1023EHW",
    energyRating: "5 Stars",
    warranty: "1 year parts & labor, 5 years compressor",
    description: "Energy efficient inverter AC with rapid cooling technology",
    discount: 12,
    inStock: true,
    imageUrl:
      "https://ansons.ph/wp-content/uploads/2024/12/29_AHAC-MINV1023EHW.jpg",
  },
  // ... more products will come from backend or fallback logic
];

function Shop() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    getCartCount,
    getCartTotal,
  } = useCart();
  const { isAuthenticated, showAuthRequiredPrompt } = useUser();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [sortBy, setSortBy] = useState("default");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [backendProducts, setBackendProducts] = useState([]);

  useEffect(() => {
    apiRequest("/products/public")
      .then((response) => {
        const mapped = (response.products || []).map((product) => ({
          id: product.id,
          name: product.name,
          brand: product.brand || "Generic",
          category: product.category || "split",
          price: Number(product.price) || 0,
          specs: product.specs || "",
          description: Array.isArray(product.features)
            ? product.features.join(", ")
            : "Energy efficient AC.",
          inStock: Number(product.stock) > 0,
          stock: Number(product.stock) || 0,
          model: product.sku || "",
          warranty: "1 year parts, 5 years compressor",
          imageUrl: product.imageUrl || "",
        }));
        setBackendProducts(mapped);
      })
      .catch(() => setBackendProducts([]));
  }, []);

  const products = useMemo(() => {
    const merged = mergeProductLists(fallbackProducts, backendProducts, {
      preferBackend: true,
      verbose: false,
    });
    return deduplicateProducts(merged, { verbose: false });
  }, [backendProducts]);

  const categories = useMemo(() => {
    const counts = products.reduce((acc, product) => {
      const key = product.category || "split";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return [
      { id: "all", name: "All Products", count: products.length },
      { id: "split", name: "Split Type AC", count: counts.split || 0 },
      { id: "window", name: "Window Type AC", count: counts.window || 0 },
      { id: "floor", name: "Floor Mounted AC", count: counts.floor || 0 },
    ];
  }, [products]);

  const brands = useMemo(
    () => [
      "all",
      ...Array.from(new Set(products.map((p) => p.brand).filter(Boolean))),
    ],
    [products],
  );

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory !== "all")
      filtered = filtered.filter((p) => p.category === selectedCategory);
    if (selectedBrand !== "all")
      filtered = filtered.filter((p) => p.brand === selectedBrand);
    if (searchTerm) {
      const low = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(low) ||
          p.brand.toLowerCase().includes(low),
      );
    }
    filtered = filtered.filter(
      (p) => p.price >= priceRange.min && p.price <= priceRange.max,
    );

    if (sortBy === "price_asc") filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc")
      filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === "name_asc")
      filtered.sort((a, b) => a.name.localeCompare(b.name));

    return filtered;
  }, [
    products,
    selectedCategory,
    selectedBrand,
    searchTerm,
    priceRange,
    sortBy,
  ]);

  const handleAddToCart = (product) => {
    if (!isAuthenticated)
      return showAuthRequiredPrompt("Please log in to add items.");
    addToCart(product, 1);
  };

  const handleCheckout = () => {
    if (!isAuthenticated)
      return showAuthRequiredPrompt("Please log in to proceed to checkout.");
    navigate("/checkout");
    setIsCartOpen(false);
  };

  const handleBuyNow = (product) => {
    if (!isAuthenticated)
      return showAuthRequiredPrompt("Please log in to buy.");
    addToCart(product, 1);
    navigate("/checkout");
  };

  return (
    <div className="bq-shop-layout">
      <BoutiqueHeader
        variant="text"
        title="Shop AC Units"
        leftAction="back"
        onLeftAction={() => navigate("/home")}
        isAuthenticated={isAuthenticated}
        onCartClick={() => setIsCartOpen(true)}
        cartCount={getCartCount()}
      />

      <main className="bq-shop-main">
        <ShopSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          brands={brands}
          selectedBrand={selectedBrand}
          onSelectBrand={setSelectedBrand}
          priceRange={priceRange}
          onPriceChange={(key, val) =>
            setPriceRange((prev) => ({ ...prev, [key]: parseInt(val) || 0 }))
          }
          onClearFilters={() => {
            setSelectedCategory("all");
            setSelectedBrand("all");
            setPriceRange({ min: 0, max: 100000 });
            setSearchTerm("");
          }}
        />

        <ShopCatalogue
          products={filteredProducts}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onProductClick={setSelectedProduct}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <BoutiqueCart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={handleCheckout}
          getCartTotal={getCartTotal}
        />
      </main>

      <BoutiqueFooter />

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-shop-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: ${BQ_COLORS.bg};
        }

        .bq-shop-main {
          display: flex;
          flex-direction: row;
          width: 100%;
          min-height: calc(100vh - ${BQ_GEOMETRY.headerHeight});
          position: relative;
        }

        /* Standardize some common elements across modules */
        * { box-sizing: border-box; }
      `,
        }}
      />
    </div>
  );
}

export default Shop;
