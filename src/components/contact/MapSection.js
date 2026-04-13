import icons from '../common/icons';

function MapSection() {
  const locations = [
    {
      name: 'Bulacan (Main Branch)',
      address: 'Plaridel, Bulacan',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Plaridel,Bulacan'
    },
    {
      name: 'Cavite Branch',
      address: 'Dasmariñas, Cavite',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Dasmariñas,Cavite'
    },
    {
      name: 'Laguna Branch',
      address: 'Cabuyao City, Laguna',
      mapsUrl: 'https://www.google.com/maps?q=Cold+Air+Laguna+Branch,+Barrio,+49+Bigaa+Rd,+Purok+Uno,+Cabuyao+City,+4025+Laguna&ftid=0x3397d9004ec7c86f:0xeed17a4b1c9945a0&entry=gps&shh=CAE&lucs=,94297699,94284481,94231188,94280568,47071704,94218641,94282134,94286869&g_ep=CAISEjI2LjEyLjIuODg0NjExMjE2MBgAIIgnKkgsOTQyOTc2OTksOTQyODQ0ODEsOTQyMzExODgsOTQyODA1NjgsNDcwNzE3MDQsOTQyMTg2NDEsOTQyODIxMzQsOTQyODY4NjlCAlBI&skid=95101466-f2c4-4afe-b57f-e503ed7f6e61&g_st=ic'
    },
    {
      name: 'Bataan Branch',
      address: 'Balanga City, Bataan',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Balanga+City,Bataan'
    },
    {
      name: 'Pangasinan Branch',
      address: 'Dagupan City, Pangasinan',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Dagupan+City,Pangasinan'
    },
    {
      name: 'Ilocos Branch',
      address: 'San Fernando City, La Union',
      mapsUrl: 'https://maps.app.goo.gl/VcwHUhQ8Xw1ZWWvy7?g_st=ic'
    }
  ];

  const handleOpenMap = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="map-section">
      <h3>
        <img src={icons.marker} alt="" className="inline-icon inline-icon--md" /> Our Branch Locations
      </h3>
      <p>Find the nearest Cold Air branch near you</p>
      <div className="map-buttons-grid">
        {locations.map((location, index) => (
          <button
            key={index}
            type="button"
            className="map-location-btn"
            onClick={() => handleOpenMap(location.mapsUrl)}
          >
            <span className="location-icon">
              <img src={icons.marker} alt="" className="inline-icon" />
            </span>
            <div className="location-info">
              <strong>{location.name}</strong>
              <small>{location.address}</small>
            </div>
            <span className="arrow-icon">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MapSection;
