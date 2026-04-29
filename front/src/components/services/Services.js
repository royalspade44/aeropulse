import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Services.css';
import icons from '../common/icons';
import ServiceBookingModal from './ServiceBookingModal';
import CustomerHeaderBrand from '../common/CustomerHeaderBrand';
import Footer from '../home/Footer';

function Services() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const categories = [
    { id: 'all', name: 'All Services', count: 6 },
    { id: 'maintenance', name: 'Maintenance', count: 2 },
    { id: 'repair', name: 'Repair', count: 2 },
    { id: 'cleaning', name: 'Cleaning', count: 2 }
  ];

  const services = [
    {
      id: 1,
      name: 'Maintenance',
      iconSrc: icons.tools,
      description: 'Regular check-ups and servicing for your AC to ensure optimal performance and energy efficiency.',
      duration: '1-2 hours',
      technicians: 2,
      price: 899,
      category: 'maintenance',
      popular: true,
      warranty: '3 months',
      discount: '10% OFF'
    },
    {
      id: 2,
      name: 'Repair',
      iconSrc: icons.tools,
      description: 'AC repair services for any issues including compressor problems, refrigerant leaks, and electrical faults.',
      duration: '2-3 hours',
      technicians: 2,
      price: 1499,
      category: 'repair',
      popular: true,
      warranty: '6 months',
      discount: null
    },
    {
      id: 3,
      name: 'Cleaning',
      iconSrc: icons.broom,
      description: 'Deep cleaning service to remove dirt, dust, mold, and bacteria from your AC unit.',
      duration: '1.5 hours',
      technicians: 1,
      price: 599,
      category: 'cleaning',
      popular: false,
      warranty: '1 month',
      discount: '15% OFF'
    },
    {
      id: 4,
      name: 'Emergency Repair',
      iconSrc: icons.diamondExclamation,
      description: '24/7 emergency AC repair service for urgent issues. Same-day response guaranteed.',
      duration: '2-3 hours',
      technicians: 2,
      price: 2499,
      category: 'repair',
      popular: false,
      warranty: '3 months',
      discount: null
    },
    {
      id: 5,
      name: 'Premium Maintenance',
      iconSrc: icons.checkCircle,
      description: 'Comprehensive maintenance including filter replacement, coil cleaning, and performance tuning.',
      duration: '2-3 hours',
      technicians: 2,
      price: 1299,
      category: 'maintenance',
      popular: true,
      warranty: '6 months',
      discount: '20% OFF'
    },
    {
      id: 6,
      name: 'Sanitization Service',
      iconSrc: icons.shieldKeyhole,
      description: 'Anti-bacterial and anti-viral sanitization for your AC unit. Improves air quality.',
      duration: '1.5 hours',
      technicians: 1,
      price: 799,
      category: 'cleaning',
      popular: false,
      warranty: '2 months',
      discount: null
    }
  ];

  const handleBack = () => {
    navigate('/home');
  };

  const handleBookService = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = (service, bookingData) => {
    let technicianFee = 0;
    let technicianLabel = '';
    
    if (bookingData.technician === 'senior') {
      technicianFee = 200;
      technicianLabel = 'Senior Technician';
    } else if (bookingData.technician === 'express') {
      technicianFee = 500;
      technicianLabel = 'Express Service';
    } else {
      technicianLabel = 'Standard Technician';
    }
    
    const totalPrice = service.price + technicianFee;
    
    const bookingDetails = {
      ...bookingData,
      service: service.name,
      basePrice: service.price,
      technicianFee: technicianFee,
      technicianLabel: technicianLabel,
      totalPrice: totalPrice,
      bookingId: Date.now(),
      status: 'processing',
      warranty: service.warranty
    };
    
    const existingBookings = localStorage.getItem('bookings');
    const bookings = existingBookings ? JSON.parse(existingBookings) : [];
    bookings.push(bookingDetails);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    alert(`Booking confirmed!\n\nService: ${service.name}\nDate: ${bookingData.date}\nTime: ${bookingData.time}\nTechnician: ${technicianLabel}\nTotal: ₱${totalPrice.toLocaleString()}\n\nWarranty: ${service.warranty}\nBooking ID: #${bookingDetails.bookingId}`);
    
    setShowBookingModal(false);
    setSelectedService(null);
  };

  const getFilteredServices = () => {
    let filtered = services;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredServices = getFilteredServices();

  return (
    <div className="services-page">
      {/* Header with back button - similar to Shop AC Units */}
      <div className="services-header-container">
        <div className="services-header-content">
          <div className="customer-header-left-group">
            <button className="back-button" onClick={handleBack}>
              ← Back
            </button>
            <CustomerHeaderBrand light />
          </div>
          <div className="customer-header-spacer" />
          <div className="customer-header-right-group services-header-title">
            <div>
              <h1>Warranty Services</h1>
              <p>Professional AC care backed by warranty</p>
            </div>
          </div>
        </div>
      </div>

      <div className="services-layout">
        {/* Sidebar with filters */}
        <aside className="services-sidebar">
          <div className="sidebar-section">
            <h3>Categories</h3>
            <div className="category-list">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span>{category.name}</span>
                  <span className="category-count">{category.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Active Filter</h3>
            <div className="active-filter">
              {selectedCategory === 'all' ? 'All Categories' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Warranty Benefits</h3>
            <div className="benefits-list">
              <div className="benefit-item"><img src={icons.checkCircle} alt="" className="inline-icon" /> 30-day service warranty</div>
              <div className="benefit-item"><img src={icons.checkCircle} alt="" className="inline-icon" /> Free re-service if unsatisfied</div>
              <div className="benefit-item"><img src={icons.checkCircle} alt="" className="inline-icon" /> Certified technicians</div>
              <div className="benefit-item"><img src={icons.checkCircle} alt="" className="inline-icon" /> Genuine spare parts</div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="services-main-content">
          {/* Search and sort bar */}
          <div className="services-toolbar">
            <div className="results-count">
              Found {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}
            </div>
            <div className="search-sort">
              <div className="search-box">
                <img src={icons.globePointer} alt="" className="inline-icon" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select className="sort-select" defaultValue="default">
                <option value="default">Sort by: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Services Grid */}
          <div className="services-grid">
            {filteredServices.map(service => (
              <div key={service.id} className={`service-card ${service.popular ? 'popular' : ''}`}>
                {service.discount && (
                  <div className="discount-badge">{service.discount}</div>
                )}
                <div className="service-card-image">
                  <span className="service-icon"><img src={service.iconSrc} alt="" className="inline-icon inline-icon--xl" /></span>
                  {service.popular && <span className="service-badge">Popular</span>}
                </div>
                <div className="service-card-content">
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-description">{service.description}</p>
                  <div className="service-details">
                    <span className="service-detail">Duration: {service.duration}</span>
                    <span className="service-detail"><img src={icons.memberList} alt="" className="inline-icon" /> {service.technicians} {service.technicians === 1 ? 'technician' : 'technicians'}</span>
                  </div>
                  <div className="service-price">
                    <div>
                      {service.discount && (
                        <span className="original-price">₱{(service.price * 1.2).toLocaleString()}</span>
                      )}
                      <span className="price-amount">₱{service.price.toLocaleString()}</span>
                    </div>
                    <span className="warranty-chip"><img src={icons.lock} alt="" className="inline-icon" /> {service.warranty} warranty</span>
                  </div>
                  <button className="book-btn" onClick={() => handleBookService(service)}>
                    Book Now →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="no-services">
              No services found matching your criteria.
            </div>
          )}
        </main>
      </div>

      {showBookingModal && selectedService && (
        <ServiceBookingModal
          service={selectedService}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedService(null);
          }}
          onConfirm={handleConfirmBooking}
        />
      )}
      <Footer />
    </div>
  );
}

export default Services;