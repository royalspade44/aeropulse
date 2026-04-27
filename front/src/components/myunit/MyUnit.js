import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyUnit.css';
import UnitCard from './UnitCard';
import AddUnitModal from './AddUnitModal';
import UnitDetailsModal from './UnitDetailsModal';
import ServiceHistory from './ServiceHistory';
import ScheduleServiceModal from './ScheduleServiceModal';
import WarrantyStatusModal from './WarrantyStatusModal';
import RegisterQrUnitModal from './RegisterQrUnitModal';
import icons from '../common/icons';
import Footer from '../home/Footer';

function MyUnit() {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    const savedUnits = localStorage.getItem('ac_units');
    if (savedUnits) {
      setUnits(JSON.parse(savedUnits));
    }
  }, []);

  const saveUnits = (updatedUnits) => {
    setUnits(updatedUnits);
    localStorage.setItem('ac_units', JSON.stringify(updatedUnits));
  };

  const handleAddUnit = (newUnit) => {
    const updatedUnits = [...units, newUnit];
    saveUnits(updatedUnits);
    setShowAddModal(false);
    alert('AC Unit added successfully!');
  };

  const handleScheduleService = (unit) => {
    setSelectedUnit(unit);
    setShowScheduleModal(true);
  };

  const handleConfirmSchedule = (unit, serviceData) => {
    const servicePrice = (() => {
      switch (serviceData.serviceTypeId) {
        case 'cleaning_inspection':
          return 899;
        case 'diagnosis_repair':
          return 1499;
        case 'location_transfer':
          return 0;
        default:
          break;
      }
      if (serviceData.serviceType === 'Cleaning and inspection') return 899;
      if (serviceData.serviceType === 'Diagnosis and repair') return 1499;
      return 899;
    })();

    const totalPrice = servicePrice + (serviceData.technician === 'senior' ? 200 : serviceData.technician === 'express' ? 500 : 0);

    const newService = {
      id: Date.now(),
      date: serviceData.date,
      time: serviceData.time,
      serviceType: serviceData.serviceType,
      details: serviceData.notes || 'Scheduled service',
      price: totalPrice,
      technician: serviceData.technician,
      status: 'scheduled'
    };

    const updatedUnits = units.map(u => {
      if (u.id === unit.id) {
        const updatedUnit = {
          ...u,
          serviceHistory: [...(u.serviceHistory || []), newService],
          status: 'Needs Service'
        };
        return updatedUnit;
      }
      return u;
    });

    saveUnits(updatedUnits);
    setShowScheduleModal(false);
    alert(`Service scheduled for ${unit.brand} ${unit.model} on ${serviceData.date} at ${serviceData.time}\nTotal: ₱${totalPrice.toLocaleString()}`);
  };

  const handleViewHistory = (unit) => {
    setSelectedUnit(unit);
    setShowHistoryModal(true);
  };

  const handleViewDetails = (unit) => {
    setSelectedUnit(unit);
    setShowDetailsModal(true);
  };

  const handleWarrantyStatus = (unit) => {
    setSelectedUnit(unit);
    setShowWarrantyModal(true);
  };

  const handleRegisterQrRequest = () => {
    setShowQrModal(true);
  };

  const handleQrRegister = (newUnit) => {
    const updatedUnits = [...units, newUnit];
    saveUnits(updatedUnits);
    setShowQrModal(false);
    alert(`Unit registered. AMPERE next service: ${newUnit.ampereNextServiceLabel || '—'}`);
  };

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <div className="myunit-container">
      <div className="myunit-header">
        <div className="myunit-header-content">
          <button className="back-btn" onClick={handleBack}>←</button>
          <h1 className="myunit-title">My AC Units</h1>
          <button className="add-unit-btn" onClick={() => setShowAddModal(true)}>
            + Add New Unit
          </button>
        </div>
      </div>

      <div className="myunit-main">
        {units.length === 0 ? (
          <div className="empty-units">
            <div className="empty-icon"><img src={icons.temperatureFrigid} alt="" className="inline-icon" style={{ width: 48, height: 48 }} /></div>
            <div className="empty-title">No AC Units Added</div>
            <div className="empty-text">Add your AC units to track maintenance and service history</div>
            <button className="add-unit-btn" onClick={() => setShowAddModal(true)} style={{ marginTop: '20px' }}>
              + Add New Unit
            </button>
          </div>
        ) : (
          <div className="units-grid">
            {units.map(unit => (
              <UnitCard
                key={unit.id}
                unit={unit}
                onClick={handleViewDetails}
                onScheduleService={handleScheduleService}
                onViewHistory={handleViewHistory}
                onWarrantyStatus={handleWarrantyStatus}
                onRegisterQr={handleRegisterQrRequest}
              />
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddUnitModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddUnit}
        />
      )}

      {showDetailsModal && selectedUnit && (
        <UnitDetailsModal
          unit={selectedUnit}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUnit(null);
          }}
        />
      )}

      {showHistoryModal && selectedUnit && (
        <ServiceHistory
          unit={selectedUnit}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedUnit(null);
          }}
        />
      )}

      {showScheduleModal && selectedUnit && (
        <ScheduleServiceModal
          unit={selectedUnit}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedUnit(null);
          }}
          onSchedule={handleConfirmSchedule}
        />
      )}

      {showWarrantyModal && selectedUnit && (
        <WarrantyStatusModal
          unit={selectedUnit}
          onClose={() => {
            setShowWarrantyModal(false);
            setSelectedUnit(null);
          }}
        />
      )}

      {showQrModal && (
        <RegisterQrUnitModal
          onClose={() => setShowQrModal(false)}
          onRegister={handleQrRegister}
        />
      )}
      <Footer />
    </div>
  );
}

export default MyUnit;