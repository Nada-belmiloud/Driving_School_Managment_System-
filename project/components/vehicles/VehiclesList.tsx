'use client';

import React, { useState } from 'react';
import { Plus, Search, Trash2, Car, X } from 'lucide-react';
import { mockVehicles, mockInstructors } from '@/lib/mockData';
import type { Vehicle, MaintenanceLog, Instructor } from '@/types';

export function VehiclesList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [instructors] = useState<Instructor[]>(mockInstructors);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isAddMaintenanceModalOpen, setIsAddMaintenanceModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const [vehicleFormData, setVehicleFormData] = useState({
    brand: '',
    model: '',
    licensePlate: '',
    instructorId: ''
  });
  const [maintenanceFormData, setMaintenanceFormData] = useState({
    date: '',
    description: ''
  });

  const getInstructorName = (instructorId?: string): string => {
    if (!instructorId) return 'Unassigned';
    const instructor = instructors.find(i => i.id === instructorId);
    return instructor ? instructor.name : 'Unassigned';
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const query = searchQuery.toLowerCase();
    const instructorName = getInstructorName(vehicle.instructorId);
    return (
      vehicle.brand.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.licensePlate.toLowerCase().includes(query) ||
      instructorName.toLowerCase().includes(query)
    );
  });

  const handleAddVehicle = () => {
    if (!vehicleFormData.brand || !vehicleFormData.model || !vehicleFormData.licensePlate) {
      alert('Please fill in all required fields');
      return;
    }

    const newVehicle: Vehicle = {
      id: String(vehicles.length + 1),
      brand: vehicleFormData.brand,
      model: vehicleFormData.model,
      licensePlate: vehicleFormData.licensePlate,
      instructorId: vehicleFormData.instructorId || undefined,
      maintenanceLogs: []
    };

    setVehicles([...vehicles, newVehicle]);
    setIsAddVehicleModalOpen(false);
    setVehicleFormData({ brand: '', model: '', licensePlate: '', instructorId: '' });
  };

  const handleAddMaintenanceLog = () => {
    if (!maintenanceFormData.date || !maintenanceFormData.description || !selectedVehicle) {
      alert('Please fill in all required fields');
      return;
    }

    const newLog: MaintenanceLog = {
      id: `m${Date.now()}`,
      date: maintenanceFormData.date,
      description: maintenanceFormData.description
    };

    const updatedVehicles = vehicles.map(vehicle => {
      if (vehicle.id === selectedVehicle.id) {
        return { ...vehicle, maintenanceLogs: [newLog, ...vehicle.maintenanceLogs] };
      }
      return vehicle;
    });

    setVehicles(updatedVehicles);
    setIsAddMaintenanceModalOpen(false);
    setSelectedVehicle(null);
    setMaintenanceFormData({ date: '', description: '' });
  };

  const confirmDeleteVehicle = () => {
    if (vehicleToDelete) {
      setVehicles(vehicles.filter(v => v.id !== vehicleToDelete.id));
      setVehicleToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const openAddMaintenanceModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setMaintenanceFormData({ date: new Date().toISOString().split('T')[0], description: '' });
    setIsAddMaintenanceModalOpen(true);
  };

  const openDeleteModal = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Vehicles</h1>
            <p className="text-sm text-gray-500 mt-1">Manage school vehicles and maintenance</p>
          </div>
          <button
            onClick={() => setIsAddVehicleModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus size={18} />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-5x">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by brand, model, or license plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            />
          </div>
        </div>

        {/* Vehicles List */}
        <div className="space-y-6">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Vehicle Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Car className="text-blue-600" size={28} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">{vehicle.licensePlate}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Assigned to: <span className="font-medium">{getInstructorName(vehicle.instructorId)}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openDeleteModal(vehicle)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Delete vehicle"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Maintenance Logs Section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-900">Maintenance Logs</h4>
                  <button
                    onClick={() => openAddMaintenanceModal(vehicle)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Add Log
                  </button>
                </div>

                {vehicle.maintenanceLogs.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 border-b">
                      <div className="col-span-2">Date</div>
                      <div className="col-span-10">Description</div>
                    </div>
                    {vehicle.maintenanceLogs.map((log) => (
                      <div key={log.id} className="grid grid-cols-12 gap-4 text-sm py-2 border-b border-gray-100 last:border-0">
                        <div className="col-span-2 text-gray-900">{log.date}</div>
                        <div className="col-span-10 text-gray-600">{log.description}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No maintenance logs yet</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <Car className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No vehicles found matching your search.</p>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {isAddVehicleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start border-b p-6 pb-4">
              <h3 className="text-xl font-semibold text-gray-900">Add Vehicle</h3>
              <button onClick={() => setIsAddVehicleModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAddVehicle(); }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                  <input
                    type="text"
                    value={vehicleFormData.brand}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, brand: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder="e.g., Renault"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                  <input
                    type="text"
                    value={vehicleFormData.model}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, model: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder="e.g., Symbol"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Plate *</label>
                  <input
                    type="text"
                    value={vehicleFormData.licensePlate}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, licensePlate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder="e.g., 16-123-31"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Instructor (Optional)</label>
                  <select
                    value={vehicleFormData.instructorId}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, instructorId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2 bg-white"
                  >
                    <option value="">Unassigned</option>
                    {instructors.map((ins) => <option key={ins.id} value={ins.id}>{ins.name}</option>)}
                  </select>
                </div>
              </form>
            </div>

            <div className="border-t p-6 pt-4">
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setIsAddVehicleModalOpen(false)} className="px-18 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                  Cancel
                </button>
                <button type="submit" onClick={handleAddVehicle} className="px-15 py-2 text-sm font-medium text-white bg-blue-600 border rounded-md">
                  Add Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Maintenance Modal */}
      {isAddMaintenanceModalOpen && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start border-b p-6 pb-4">
              <h3 className="text-xl font-semibold text-gray-900">Add Maintenance Log</h3>
              <button onClick={() => { setIsAddMaintenanceModalOpen(false); setSelectedVehicle(null); }} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAddMaintenanceLog(); }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={maintenanceFormData.date}
                    onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={maintenanceFormData.description}
                    onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, description: e.target.value })}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md p-2 resize-none"
                    placeholder="e.g., Oil changed, tire pressure adjusted..."
                  />
                </div>
              </form>
            </div>

            <div className="border-t p-6 pt-4">
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => { setIsAddMaintenanceModalOpen(false); setSelectedVehicle(null); }} className="px-18 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                  Cancel
                </button>
                <button type="submit" onClick={handleAddMaintenanceLog} className="px-18 py-2 text-sm font-medium text-white bg-blue-600 border rounded-md">
                  Add Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && vehicleToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Delete Vehicle</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{vehicleToDelete.brand} {vehicleToDelete.model}</strong>?
            </p>
             <p className="text-orange-500 mb-6">
              This Vehicle is  currently assigned to an instructor. Deleting it will unassign the instructor 
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                Cancel
              </button>
              <button onClick={confirmDeleteVehicle} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border rounded-md">
                Delete Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}