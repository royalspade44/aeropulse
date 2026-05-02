import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';
import { apiRequest } from '../../config/api';
import icons from '../common/icons';
import './Shop.css';
import CategoryFilter from './CategoryFilter';
import ProductGrid from './ProductGrid';
import CartSidebar from './CartSidebar';
import ProductModal from './ProductModal';
import ServiceAreaSelector from '../customer/ServiceAreaSelector';
import Footer from '../home/Footer';

// Products with imageUrl support only (no productUrl)
const fallbackProducts = [
  // ===== AMERICAN HOME INVERTER (Split Type) =====
  { 
    id: 1, name: 'American Home Inverter AC', brand: 'American Home', category: 'split',
    price: 18499, oldPrice: 20999, specs: '1.0HP', model: 'AHAC-MINV1023EHW', 
    energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
    description: 'Energy efficient inverter AC with rapid cooling technology', 
    discount: 12, inStock: true,
    imageUrl: 'https://ansons.ph/wp-content/uploads/2024/12/29_AHAC-MINV1023EHW.jpg' // Add your image URL here
  },
    // ===== AMERICAN HOME INVERTER (Split Type) =====
    { 
      id: 1, name: 'American Home Inverter AC', brand: 'American Home', category: 'split',
      price: 18499, oldPrice: 20999, specs: '1.0HP', model: 'AHAC-MINV1023EHW', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Energy efficient inverter AC with rapid cooling technology', 
      discount: 12, inStock: true,
      imageUrl: 'https://ansons.ph/wp-content/uploads/2024/12/29_AHAC-MINV1023EHW.jpg' // Add your image URL here
    },
    { 
      id: 2, name: 'American Home Inverter AC', brand: 'American Home', category: 'split',
      price: 21999, oldPrice: 24999, specs: '1.5HP', model: 'AHAC-MINV1523EHW', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Energy efficient inverter AC with rapid cooling technology', 
      discount: 12, inStock: true,
      imageUrl: 'https://lh6.googleusercontent.com/proxy/U2nLoCzYuJbL4ZscaAExVPmrZwi0ypWILcqmVQei7rwDfT_htCNq9uzBvaDRmiOsSuT0Ccf7vT9PN8CkHJzbv-qBFSMutZVuhJ16'
    },
    { 
      id: 3, name: 'American Home Inverter AC', brand: 'American Home', category: 'split',
      price: 28499, oldPrice: 32999, specs: '2.0HP', model: 'AHAC-MINV2023EHW', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Energy efficient inverter AC with rapid cooling technology', 
      discount: 13, inStock: true,
      imageUrl: 'https://ansons.ph/wp-content/uploads/2024/12/29_AHAC-MINV1023EHW.jpg'
    },
    { 
      id: 4, name: 'American Home Inverter AC', brand: 'American Home', category: 'split',
      price: 31499, oldPrice: 36999, specs: '2.5HP', model: 'AHAC-MINV2523EHW', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Energy efficient inverter AC with rapid cooling technology', 
      discount: 14, inStock: true,
      imageUrl: 'https://www.ldraenterprises.com/wp-content/uploads/2025/08/Untitled-1-300x300.jpg'
    },
    { 
      id: 5, name: 'American Home Inverter AC', brand: 'American Home', category: 'split',
      price: 43999, oldPrice: 49999, specs: '3.0HP', model: 'AHAC-MINV3023EHW', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Energy efficient inverter AC with rapid cooling technology', 
      discount: 12, inStock: true,
      imageUrl: 'https://www.ldraenterprises.com/wp-content/uploads/2025/08/Untitled-1-300x300.jpg'
    },

    // ===== TCL FULL DC INVERTER (Split Type) =====
    { 
      id: 6, name: 'TCL Full DC Inverter AC', brand: 'TCL', category: 'split',
      price: 21500, specs: '1.0HP', model: 'TAC-10CSD/KEI-S/2', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Full DC inverter with T-AI technology and WiFi control. Features: Golden titanium fin, Fast cooling, Filter Cleaning Reminder, 42db Low Noise Operation', 
      inStock: true, featured: true,
      imageUrl: 'https://d1rlzxa98cyc61.cloudfront.net/catalog/product/1/9/196330_4.jpg?auto=webp&format=pjpg&width=640'
    },
    { 
      id: 7, name: 'TCL Full DC Inverter AC', brand: 'TCL', category: 'split',
      price: 22500, specs: '1.5HP', model: 'TAC-13CSD/KEI-S/2', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Full DC inverter with T-AI technology and WiFi control', 
      inStock: true,
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZhqB0c7O2-OQ-9vMRvxdt3vfJW9PbXcE9fw&s'
    },
    { 
      id: 8, name: 'TCL Full DC Inverter AC', brand: 'TCL', category: 'split',
      price: 28700, specs: '2.0HP', model: 'TAC-19CSD/KEI-S/2', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Full DC inverter with T-AI technology and WiFi control', 
      inStock: true,
      imageUrl: 'https://ansons.ph/wp-content/uploads/2025/04/02_TAC-CSD_KEI2.jpg'
    },
    { 
      id: 9, name: 'TCL Full DC Inverter AC', brand: 'TCL', category: 'split',
      price: 33600, specs: '2.5HP', model: 'TAC-25CSD/KEI-S/2', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Full DC inverter with T-AI technology and WiFi control', 
      inStock: true,
      imageUrl: 'https://boomupp.com/wp-content/uploads/2025/03/TCL-KEi-S222.png'
    },
    { 
      id: 10, name: 'TCL Full DC Inverter AC', brand: 'TCL', category: 'split',
      price: 48999, specs: '3.0HP', model: 'TAC-30CSD/KEI-S/2', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Full DC inverter with T-AI technology and WiFi control', 
      inStock: true,
      imageUrl: 'https://d1rlzxa98cyc61.cloudfront.net/catalog/product/1/9/196334_2025_4.jpg?auto=webp&format=pjpg&width=640'
    },

    // ===== MIDEA CELEST PRO (Split Type) =====
    { 
      id: 11, name: 'Midea Celest Pro AC', brand: 'Midea', category: 'split',
      price: 22999, oldPrice: 26999, specs: '1.0HP', model: 'MSCE-10CRFN8', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'New model with advanced cooling technology', 
      discount: 14, inStock: true,
      imageUrl: 'https://www.remalsales.com/assets/images/aircon%202024/msce_crfn8.png'
    },
    { 
      id: 12, name: 'Midea Celest Pro AC', brand: 'Midea', category: 'split',
      price: 23999, oldPrice: 27999, specs: '1.5HP', model: 'MSCE-13CRFN8', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'New model with advanced cooling technology', 
      discount: 14, inStock: true,
      imageUrl: 'https://www.remalsales.com/assets/images/aircon%202024/msce_crfn8.png'
    },
    { 
      id: 13, name: 'Midea Celest Pro AC', brand: 'Midea', category: 'split',
      price: 30499, oldPrice: 35999, specs: '2.0HP', model: 'MSCE-19CRFN8', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'New model with advanced cooling technology', 
      discount: 15, inStock: true,
      imageUrl: 'https://www.remalsales.com/assets/images/aircon%202024/msce_crfn8.png'
    },
    { 
      id: 14, name: 'Midea Celest Pro AC', brand: 'Midea', category: 'split',
      price: 35499, oldPrice: 41999, specs: '2.5HP', model: 'MSCE-22CRFN8', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'New model with advanced cooling technology', 
      discount: 15, inStock: true,
      imageUrl: 'https://www.remalsales.com/assets/images/aircon%202024/msce_crfn8.png'
    },
    { 
      id: 15, name: 'Midea Celest Pro AC', brand: 'Midea', category: 'split',
      price: 51499, oldPrice: 59999, specs: '3.0HP', model: 'MSCE-25CRFN8', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'New model with advanced cooling technology', 
      discount: 14, inStock: true,
      imageUrl: 'https://www.remalsales.com/assets/images/aircon%202024/msce_crfn8.png'
    },

    // ===== AUX QCDI FULL DC INVERTER (Split Type) =====
    { 
      id: 16, name: 'Aux QCDI Full DC Inverter', brand: 'Aux', category: 'split',
      price: 21499, specs: '1.0HP', model: 'ASW09A/QCDI', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Full DC inverter with energy saving technology', 
      inStock: true,
      imageUrl: 'https://mws-data.auxair.com/upload/2024-04-07/1712478296443_50f494b0-f4b8-11ee-8241-4555d2ac6d44.png'
    },
    { 
      id: 17, name: 'Aux QCDI Full DC Inverter', brand: 'Aux', category: 'split',
      price: 22999, specs: '1.5HP', model: 'ASW12A/QCDI', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Full DC inverter with energy saving technology', 
      inStock: true,
      imageUrl: 'https://mws-data.auxair.com/upload/2024-04-07/1712478296443_50f494b0-f4b8-11ee-8241-4555d2ac6d44.png'
    },
    { 
      id: 18, name: 'Aux QCDI Full DC Inverter', brand: 'Aux', category: 'split',
      price: 30499, specs: '2.0HP', model: 'ASW18A/QCDI', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Full DC inverter with energy saving technology', 
      inStock: true,
      imageUrl: 'https://mws-data.auxair.com/upload/2024-04-07/1712478296443_50f494b0-f4b8-11ee-8241-4555d2ac6d44.png'
    },
    { 
      id: 19, name: 'Aux QCDI Full DC Inverter', brand: 'Aux', category: 'split',
      price: 35499, specs: '2.5HP', model: 'ASW24A/QCDI', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Full DC inverter with energy saving technology', 
      inStock: true,
      imageUrl: 'https://mws-data.auxair.com/upload/2024-04-07/1712478296443_50f494b0-f4b8-11ee-8241-4555d2ac6d44.png'
    },
    { 
      id: 20, name: 'Aux QCDI Full DC Inverter', brand: 'Aux', category: 'split',
      price: 47499, specs: '3.0HP', model: 'ASW30A/QCDI', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Full DC inverter with energy saving technology', 
      inStock: true,
      imageUrl: 'https://mws-data.auxair.com/upload/2024-04-07/1712478296443_50f494b0-f4b8-11ee-8241-4555d2ac6d44.png'
    },

    // ===== SAMSUNG DIGITAL INVERTER (Split Type) =====
    { 
      id: 21, name: 'Samsung Digital Inverter AC', brand: 'Samsung', category: 'split',
      price: 22999, specs: '1.0HP', model: 'AR09TYHYE', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Digital inverter technology with smart features', 
      inStock: true, featured: true,
      imageUrl: ''
    },
    { 
      id: 22, name: 'Samsung Digital Inverter AC', brand: 'Samsung', category: 'split',
      price: 25999, specs: '1.5HP', model: 'AR12TYHYE', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Digital inverter technology with smart features', 
      inStock: true,
      imageUrl: ''
    },
    { 
      id: 23, name: 'Samsung Digital Inverter AC', brand: 'Samsung', category: 'split',
      price: 30999, specs: '2.0HP', model: 'AR18TYHYE', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Digital inverter technology with smart features', 
      inStock: true,
      imageUrl: ''
    },
    { 
      id: 24, name: 'Samsung Digital Inverter AC', brand: 'Samsung', category: 'split',
      price: 35999, specs: '2.5HP', model: 'AR24TYHYE', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Digital inverter technology with smart features', 
      inStock: true,
      imageUrl: ''
    },

    // ===== LG PREMIUM DUAL INVERTER (Split Type) =====
    { 
      id: 25, name: 'LG Premium Dual Inverter AC', brand: 'LG', category: 'split',
      price: 31499, oldPrice: 39999, specs: '1.0HP', model: 'HSN09IPX3', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: '70% energy savings with WiFi, Ionizer & UV Light. Features: Dual Inverter Compressor, SmartThinQ WiFi, UVnano Technology', 
      discount: 21, inStock: true, featured: true,
      imageUrl: ''
    },
    { 
      id: 26, name: 'LG Premium Dual Inverter AC', brand: 'LG', category: 'split',
      price: 33499, oldPrice: 42999, specs: '1.5HP', model: 'HSN12IPX3', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: '70% energy savings with WiFi, Ionizer & UV Light', 
      discount: 22, inStock: true,
      imageUrl: ''
    },
    { 
      id: 27, name: 'LG Premium Dual Inverter AC', brand: 'LG', category: 'split',
      price: 41499, oldPrice: 52999, specs: '2.0HP', model: 'HSN18IPX3', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: '70% energy savings with WiFi, Ionizer & UV Light', 
      discount: 21, inStock: true,
      imageUrl: ''
    },
    { 
      id: 28, name: 'LG Premium Dual Inverter AC', brand: 'LG', category: 'split',
      price: 46499, oldPrice: 59999, specs: '2.5HP', model: 'HSN24IPX3', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: '70% energy savings with WiFi, Ionizer & UV Light', 
      discount: 22, inStock: true,
      imageUrl: ''
    },
    { 
      id: 29, name: 'LG Premium Dual Inverter AC', brand: 'LG', category: 'split',
      price: 82999, oldPrice: 99999, specs: '3.0HP', model: 'HSN30IPC', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: '70% energy savings with WiFi, Ionizer & UV Light', 
      discount: 17, inStock: true,
      imageUrl: ''
    },

    // ===== LG STANDARD DUAL INVERTER (Split Type) =====
    { 
      id: 30, name: 'LG Standard Dual Inverter AC', brand: 'LG', category: 'split',
      price: 24999, specs: '1.0HP', model: 'HSN09IBA', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: '70% energy savings with dual inverter technology', 
      inStock: true,
      imageUrl: ''
    },
    { 
      id: 31, name: 'LG Standard Dual Inverter AC', brand: 'LG', category: 'split',
      price: 27999, specs: '1.5HP', model: 'HSN12IBA', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: '70% energy savings with dual inverter technology', 
      inStock: true,
      imageUrl: ''
    },
    { 
      id: 32, name: 'LG Standard Dual Inverter AC', brand: 'LG', category: 'split',
      price: 32999, specs: '2.0HP', model: 'HSN18IBA', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: '70% energy savings with dual inverter technology', 
      inStock: true,
      imageUrl: ''
    },
    { 
      id: 33, name: 'LG Standard Dual Inverter AC', brand: 'LG', category: 'split',
      price: 38999, specs: '2.5HP', model: 'HSN24IBA', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: '70% energy savings with dual inverter technology', 
      inStock: true,
      imageUrl: ''
    },

    // ===== WINDOW TYPE ACs =====
    { 
      id: 34, name: 'TCL Full DC Inverter Window AC', brand: 'TCL', category: 'window',
      price: 21995, oldPrice: 25995, specs: '1.0HP', model: 'TAC09 CWI/UJE2', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Quiet operation with WiFi control, 75% energy savings vs Non-inverter. Features: T-AI Technology, Golden titanium fin, Fast cooling, Filter Cleaning Reminder, 42db Low Noise Operation', 
      discount: 15, inStock: true,
      imageUrl: ''
    },
    { 
      id: 35, name: 'TCL Full DC Inverter Window AC', brand: 'TCL', category: 'window',
      price: 23995, oldPrice: 27995, specs: '1.5HP', model: 'TAC12 CWI/UJE2', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Quiet operation with WiFi control, 75% energy savings vs Non-inverter', 
      discount: 14, inStock: true,
      imageUrl: ''
    },
    { 
      id: 36, name: 'TCL Full DC Inverter Window AC', brand: 'TCL', category: 'window',
      price: 31995, oldPrice: 37995, specs: '2.0HP', model: 'TAC18 CWI/UJE2', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Quiet operation with WiFi control, 75% energy savings vs Non-inverter', 
      discount: 15, inStock: true,
      imageUrl: ''
    },
    { 
      id: 37, name: 'TCL Full DC Inverter Window AC', brand: 'TCL', category: 'window',
      price: 35995, oldPrice: 42995, specs: '2.5HP', model: 'TAC24 CWI/UJE2', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Quiet operation with WiFi control, 75% energy savings vs Non-inverter', 
      discount: 16, inStock: true,
      imageUrl: ''
    },

    // ===== FLOOR MOUNTED ACs =====
    { 
      id: 38, name: 'Carrier Opus Inverter Floor Mounted', brand: 'Carrier', category: 'floor',
      price: 95000, oldPrice: 109999, specs: '3.0HP', model: '53CNV030WTHP', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Energenius Inverter Technology with 6.40 PHP/hour cost to run, 18 Speed Fan Control, 3D Cooling, Multi Directional Airflow, Adaptive Cooling, Mood Lightning and LED Panel Display', 
      discount: 13, inStock: true, featured: true,
      imageUrl: ''
    },
    { 
      id: 39, name: 'Carrier Slim Floor Mounted', brand: 'Carrier', category: 'floor',
      price: 100000, oldPrice: 115000, specs: '4.0HP', model: '53CLV036308', 
      energyRating: '5 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Energenius Inverter Technology with 7.00 PHP/hour cost to run, Low Sound at 22 dB(A), 3D Airflow 85°, Horizontal Air swing, Gold Fin Coating, Be+ ionizer, Sure shield Warranty', 
      discount: 13, inStock: true,
      imageUrl: ''
    },
    { 
      id: 40, name: 'TCL Floor Mounted AC', brand: 'TCL', category: 'floor',
      price: 55000, oldPrice: 65000, specs: '3.0HP', model: 'TAC-FM30', 
      energyRating: '4 Stars', warranty: '1 year parts & labor, 5 years compressor', 
      description: 'Powerful floor mounted cooling solution for large spaces', 
      discount: 15, inStock: true,
      imageUrl: ''
    }
  ];

// Products with imageUrl support only (no productUrl)
function Shop() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, addToCart, updateQuantity, removeFromCart, getCartCount, getCartTotal } = useCart();
  const { isAuthenticated, showAuthRequiredPrompt } = useUser();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [sortBy, setSortBy] = useState('default');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceAreaLabel, setServiceAreaLabel] = useState('');
  const [backendProducts, setBackendProducts] = useState([]);

  const onServiceAreaChange = useCallback((area) => {
    setServiceAreaLabel(area?.label || '');
  }, []);

  useEffect(() => {
    apiRequest('/products/public')
      .then((response) => {
        const mapped = (response.products || []).map((product) => ({
          id: product.id,
          name: product.name,
          brand: product.brand || 'Generic',
          category: product.category || 'split',
          price: Number(product.price) || 0,
          specs: product.specs || '',
          description: Array.isArray(product.features) && product.features.length > 0
            ? product.features.join(', ')
            : 'Energy efficient AC unit ready for installation.',
          inStock: Number(product.stock) > 0,
          stock: Number(product.stock) || 0,
          model: product.sku || '',
          energyRating: '5 Stars',
          warranty: '1 year parts & labor, 5 years compressor',
          imageUrl: '',
        }));
        setBackendProducts(mapped);
      })
      .catch(() => setBackendProducts([]));
  }, []);

  const products = useMemo(() => {
    // Combine backend products with fallback products, prioritizing backend data
    const combined = [...fallbackProducts];
    
    // If we have backend products, merge them (backend takes precedence for matching IDs)
    if (backendProducts.length > 0) {
      backendProducts.forEach(backendProduct => {
        const existingIndex = combined.findIndex(p => p.id === backendProduct.id);
        if (existingIndex >= 0) {
          // Update existing product with backend data
          combined[existingIndex] = { ...combined[existingIndex], ...backendProduct };
        } else {
          // Add new backend product
          combined.push(backendProduct);
        }
      });
    }
    
    return combined;
  }, [backendProducts]);

  const categories = useMemo(() => {
    const counts = products.reduce((acc, product) => {
      const key = product.category || 'split';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return [
      { id: 'all', name: 'All Products', count: products.length },
      { id: 'split', name: 'Split Type AC', count: counts.split || 0 },
      { id: 'window', name: 'Window Type AC', count: counts.window || 0 },
      { id: 'floor', name: 'Floor Mounted AC', count: counts.floor || 0 },
    ];
  }, [products]);

  const brands = useMemo(
    () => ['all', ...Array.from(new Set(products.map((product) => product.brand).filter(Boolean)))],
    [products]
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedBrand = (params.get('brand') || '').trim();
    if (!requestedBrand) return;

    const normalizedRequested = requestedBrand.toLowerCase();
    const matchedBrand = brands.find((brand) => brand.toLowerCase() === normalizedRequested);
    if (matchedBrand) {
      setSelectedBrand(matchedBrand);
    }
  }, [location.search, brands]);

  const getFilteredProducts = () => {
    let filtered = products;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(p => p.brand === selectedBrand);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    filtered = filtered.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);
    
    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name_asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'discount_desc') {
      filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }
    
    return filtered;
  };

  const handleAddToCart = (product, quantity = 1) => {
    if (!isAuthenticated) {
      showAuthRequiredPrompt('Please log in to add items to your cart.');
      return;
    }
    addToCart(product, quantity);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      showAuthRequiredPrompt('Please log in to proceed to checkout.');
      return;
    }
    navigate('/checkout');
    setIsCartOpen(false);
  };

  const handleBuyNow = (product) => {
    if (!isAuthenticated) {
      showAuthRequiredPrompt('Please log in to make a purchase.');
      return;
    }
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleBack = () => {
    navigate('/home');
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="shop-container">
      <div className="shop-header">
        <div className="shop-header-content">
          <div className="shop-header-left">
            <button className="back-btn" onClick={handleBack}>←</button>
            <div>
              <h1 className="shop-title">Shop AC Units</h1>
              {serviceAreaLabel && (
                <p className="shop-service-area-pill">Delivering to: {serviceAreaLabel}</p>
              )}
            </div>
          </div>
          <div className="shop-header-right">
            <button type="button" className="cart-icon-btn" onClick={() => setIsCartOpen(true)} aria-label="Open cart">
              <img src={icons.cartShoppingFast} alt="" className="inline-icon inline-icon--lg" />
              {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
            </button>
          </div>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="shop-auth-banner">
          <div className="banner-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <span>You're browsing as a guest. <strong>Log in to add items to cart and checkout.</strong></span>
          </div>
        </div>
      )}

      <div className="shop-main">
        <div className="shop-sidebar">
          <ServiceAreaSelector onAreaChange={onServiceAreaChange} />
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          
          <div className="brand-filter">
            <h3 className="sidebar-title">Brands</h3>
            <input
              type="text"
              placeholder="Search brands..."
              className="brand-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="brand-list">
              <label className="brand-checkbox">
                <input
                  type="radio"
                  name="brand"
                  checked={selectedBrand === 'all'}
                  onChange={() => setSelectedBrand('all')}
                />
                <span>All Brands</span>
              </label>
              {brands.filter((brand) => brand !== 'all').map(brand => (
                <label key={brand} className="brand-checkbox">
                  <input
                    type="radio"
                    name="brand"
                    checked={selectedBrand === brand}
                    onChange={() => setSelectedBrand(brand)}
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="price-range">
            <h3 className="sidebar-title">Price Range</h3>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                className="price-input"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                className="price-input"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 100000 })}
              />
            </div>
          </div>

          <button className="clear-filters" onClick={() => {
            setSelectedCategory('all');
            setSelectedBrand('all');
            setPriceRange({ min: 0, max: 100000 });
            setSearchTerm('');
            setSortBy('default');
          }}>
            Clear All Filters
          </button>
        </div>

        <div className="products-area">
          <div className="products-header">
            <div className="results-count">
              Found {filteredProducts.length} products
            </div>
            <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">Sort by: Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="discount_desc">Biggest Discount</option>
            </select>
          </div>

          <ProductGrid
            products={filteredProducts}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onProductClick={setSelectedProduct}
          />
        </div>
      </div>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
        getCartTotal={getCartTotal}
      />

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
      <Footer />
    </div>
  );
}

export default Shop;