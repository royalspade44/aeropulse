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
import ReportIssueModal from './ReportIssueModal';
import icons from '../common/icons';
import Footer from '../home/Footer';
import { apiRequest } from '../../config/api';
import { useUser } from '../../context/UserContext';

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
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingUnit, setReportingUnit] = useState(null);

  const { user } = useUser();

  useEffect(() => {
    const savedUnits = localStorage.getItem('ac_units');
    if (savedUnits) {
      const parsedUnits = JSON.parse(savedUnits);
      if (Array.isArray(parsedUnits) && parsedUnits.length > 0) {
        setUnits(parsedUnits);
        return;
      }
    }

    const demoUnits = [
      {
        id: 'demo-unit-001',
        brand: 'Daikin',
        model: 'FTKM Series',
        serialNumber: 'DKN-20240514-001',
        installationDate: '2025-02-15',
        status: 'Good',
        ampereNextServiceLabel: 'Next recommended service in 180 days',
        technicianReportSummary: 'Demo report: unit passed installation inspection. Monitor cooling efficiency monthly.',
        installEnvironmentNotes: 'Mounted in living room with unobstructed airflow.',
        notes: 'This demo unit helps validate the unit, report, and admin assignment flow.',
        serviceHistory: [
          {
            id: 'demo-svc-001',
            date: '2025-03-10',
            time: '09:00',
            serviceType: 'Cleaning and inspection',
            details: 'Initial demo maintenance completed',
            price: 899,
            technician: 'Senior tech',
            status: 'Completed',
          },
        ],
      },
    ];

    setUnits(demoUnits);
    localStorage.setItem('ac_units', JSON.stringify(demoUnits));
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

  const handleReportIssue = (unit) => {
    setReportingUnit(unit);
    setShowReportModal(true);
  };

  const handleSubmitReport = async (reportData) => {
    if (!reportingUnit) return;

    try {
      await apiRequest('/service-requests/me', {
        method: 'POST',
        body: JSON.stringify({
          customerName: user?.name || user?.email || 'Demo customer',
          customerEmail: user?.email || '',
          customerPhone: user?.phone || '',
          issueType: reportData.issueType,
          issueDescription: reportData.issueDescription,
          issue: `${reportData.issueType}: ${reportData.issueDescription}`,
          address: reportData.address,
          unitId: reportingUnit.id,
          unitName: `${reportingUnit.brand} ${reportingUnit.model}`,
          status: 'Submitted',
        }),
      });

      const updatedUnits = units.map((u) => {
        if (u.id === reportingUnit.id) {
          return {
            ...u,
            status: 'Needs Service',
            technicianReportSummary: `Issue reported: ${reportData.issueDescription}`,
            notes: `A service report has been submitted to admin for assignment.`,
          };
        }
        return u;
      });

      saveUnits(updatedUnits);
      setShowReportModal(false);
      setReportingUnit(null);
      alert('Issue reported successfully. Admin will receive the service request and assign a technician.');
    } catch (error) {
      alert(error?.message || 'Failed to send report. Please try again.');
    }
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
                onReportIssue={handleReportIssue}
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
          onReport={handleReportIssue}
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

      {showReportModal && reportingUnit && (
        <ReportIssueModal
          unit={reportingUnit}
          user={user}
          onClose={() => {
            setShowReportModal(false);
            setReportingUnit(null);
          }}
          onSubmit={handleSubmitReport}
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