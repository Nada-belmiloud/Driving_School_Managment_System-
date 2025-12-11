'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Pencil, Loader2 } from 'lucide-react';
import { instructorsApi, vehiclesApi } from '@/lib/api';
import { toast } from 'sonner';

interface Instructor {
  _id: string;
  id?: string;
  name: string;
  phone: string;
  email: string;
  vehicleId?: string;
  workingHours: string;
  maxStudents: number;
  currentStudents: number;
}

interface Vehicle {
  _id: string;
  id?: string;
  brand: string;
  model: string;
  licensePlate: string;
}

export function InstructorsList() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [instructorToDelete, setInstructorToDelete] = useState<Instructor | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleId: '',
    workingHours: '9:00–17:00 (1h lunch at 12:00)',
    maxStudents: 15,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [instructorsRes, vehiclesRes] = await Promise.all([
        instructorsApi.getAll({ limit: 100 }),
        vehiclesApi.getAll({ limit: 100 })
      ]);

      if (instructorsRes.success && instructorsRes.data) {
        setInstructors((instructorsRes.data as { instructors: Instructor[] }).instructors || []);
      }
      if (vehiclesRes.success && vehiclesRes.data) {
        setVehicles((vehiclesRes.data as { vehicles: Vehicle[] }).vehicles || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load instructors');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string): string =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  const getVehicleInfo = (vehicleId?: string): string => {
    if (!vehicleId) return 'N/A';
    const vehicle = vehicles.find((v) => v._id === vehicleId || v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.licensePlate}` : 'N/A';
  };

  const filteredInstructors = instructors.filter((instructor) => {
    const query = searchQuery.toLowerCase();
    return (
      instructor.name.toLowerCase().includes(query) ||
      instructor.phone.toLowerCase().includes(query) ||
      instructor.email.toLowerCase().includes(query)
    );
  });

  const handleEdit = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setIsEditMode(true);
    setFormData({
      name: instructor.name,
      phone: instructor.phone,
      email: instructor.email,
      vehicleId: instructor.vehicleId || '',
      workingHours: instructor.workingHours || '9:00–17:00 (1h lunch at 12:00)',
      maxStudents: instructor.maxStudents || 15,
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (instructor: Instructor) => {
    setInstructorToDelete(instructor);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (instructorToDelete) {
      try {
        const result = await instructorsApi.delete(instructorToDelete._id);
        if (result.success) {
          toast.success('Instructor deleted successfully');
          fetchData();
        } else {
          toast.error(result.error || 'Failed to delete instructor');
        }
      } catch (error) {
        toast.error('Failed to delete instructor');
      }
      setIsDeleteModalOpen(false);
      setInstructorToDelete(null);
    }
  };

  const handleAddInstructor = async () => {
    if (!formData.name || !formData.phone || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (isEditMode && editingInstructor) {
        const result = await instructorsApi.update(editingInstructor._id, formData);
        if (result.success) {
          toast.success('Instructor updated successfully');
          fetchData();
        } else {
          toast.error(result.error || 'Failed to update instructor');
        }
      } else {
        const result = await instructorsApi.create({
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        });
        if (result.success) {
          toast.success('Instructor added successfully');
          // Assign vehicle if selected
          if (formData.vehicleId && result.data) {
            await instructorsApi.assignVehicle((result.data as { _id: string })._id, formData.vehicleId);
          }
          fetchData();
        } else {
          toast.error(result.error || 'Failed to add instructor');
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    }

    setIsAddModalOpen(false);
    setIsEditMode(false);
    setEditingInstructor(null);

    setFormData({
      name: '',
      phone: '',
      email: '',
      vehicleId: '',
      workingHours: '9:00–17:00 (1h lunch at 12:00)',
      maxStudents: 15,
    });
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsEditMode(false);
    setEditingInstructor(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Instructors</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
        >
          <Plus size={18} />
          Add Instructor
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative w-full max-w-5xl">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search instructors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                      focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredInstructors.map((inst) => (
          <div
            key={inst._id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
          >
            {/* Avatar + Name */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
                {getInitials(inst.name)}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">{inst.name}</h3>
                <p className="text-sm text-gray-500">{inst.email}</p>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Phone:</span> {inst.phone}
              </p>

              <p>
                <span className="font-medium">Vehicle:</span> {getVehicleInfo(inst.vehicleId)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => handleEdit(inst)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
              >
                <Pencil size={18} />
              </button>

              <button
                onClick={() => handleDeleteClick(inst)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {filteredInstructors.length === 0 && (
          <p className="text-center text-gray-500 col-span-full py-10">
            No instructors found.
          </p>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {isEditMode ? 'Edit Instructor' : 'Add New Instructor'}
              </h2>

              {/* Form */}
              <div className="space-y-4">
                {['name', 'phone', 'email'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {field === 'name'
                        ? 'Full Name *'
                        : field === 'phone'
                        ? 'Phone Number *'
                        : 'Email *'}
                    </label>
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      value={(formData as any)[field]}
                      onChange={(e) =>
                        setFormData({ ...formData, [field]: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Assigned Vehicle *
                  </label>
                  <select
                    value={formData.vehicleId}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicleId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.brand} {v.model} ({v.licensePlate})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Working Hours *
                  </label>
                  <input
                    type="text"
                    value={formData.workingHours}
                    onChange={(e) =>
                      setFormData({ ...formData, workingHours: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Max Students *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxStudents}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxStudents: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddInstructor}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isEditMode ? 'Save Changes' : 'Add Instructor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && instructorToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Delete Instructor
            </h2>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{' '}
              <strong>{instructorToDelete.name}</strong>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
