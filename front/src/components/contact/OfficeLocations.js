import icons from '../common/icons';

function OfficeLocations() {
  const locations = [
    { 
      country: 'Philippines', 
      office: 'Bulacan (Main Branch)', 
      address: 'Plaridel, Bulacan',
      isMain: true,
      contact: '+63 912 345 6789'
    },
    { 
      country: 'Philippines', 
      office: 'Cavite Branch', 
      address: 'Dasmariñas, Cavite',
      isMain: false,
      contact: '+63 923 456 7890'
    },
    { 
      country: 'Philippines', 
      office: 'Laguna Branch', 
      address: 'Cabuyao City, Laguna',
      isMain: false,
      contact: '+63 934 567 8901'
    },
    { 
      country: 'Philippines', 
      office: 'Bataan Branch', 
      address: 'Balanga City, Bataan',
      isMain: false,
      contact: '+63 945 678 9012'
    },
    { 
      country: 'Philippines', 
      office: 'Pangasinan Branch', 
      address: 'Dagupan City, Pangasinan',
      isMain: false,
      contact: '+63 956 789 0123'
    },
    { 
      country: 'Philippines', 
      office: 'Ilocos Branch', 
      address: 'San Fernando City, La Union',
      isMain: false,
      contact: '+63 967 890 1234'
    }
  ];

  return (
    <div className="locations-section">
      <h3>Our Offices</h3>
      <p>Serving customers across Luzon with dedicated local branches.</p>
      <div className="locations-grid">
        {locations.map((loc, index) => (
          <div key={index} className={`location-card ${loc.isMain ? 'main-branch' : ''}`}>
            {loc.isMain && (
              <div className="main-badge">
                <img src={icons.checkCircle} alt="" className="inline-icon" /> Main Branch
              </div>
            )}
            <div className="location-office">{loc.office}</div>
            <div className="location-address">{loc.address}</div>
            <div className="location-contact"><img src={icons.phoneCall} alt="" className="inline-icon" /> {loc.contact}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OfficeLocations;