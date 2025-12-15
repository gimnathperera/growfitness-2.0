import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

interface Code {
  _id: string;
  code: string;
  type: string;
  discountPercentage?: number;
  discountAmount?: number;
  status: string;
  expiryDate?: string;
  usageLimit: number;
  usageCount: number;
  description?: string;
}

export function CodesPage() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'DISCOUNT',
    discountPercentage: '',
    discountAmount: '',
    expiryDate: '',
    usageLimit: '1',
    description: '',
  });

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<{ data: Code[]; total: number; page: number; limit: number }>('/codes?page=1&limit=100');
      setCodes(response.data || []);
    } catch (error) {
      console.error('Failed to load codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        code: formData.code,
        type: formData.type,
        usageLimit: parseInt(formData.usageLimit),
      };
      if (formData.discountPercentage) payload.discountPercentage = parseFloat(formData.discountPercentage);
      if (formData.discountAmount) payload.discountAmount = parseFloat(formData.discountAmount);
      if (formData.expiryDate) payload.expiryDate = formData.expiryDate;
      if (formData.description) payload.description = formData.description;

      await apiRequest('/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setShowForm(false);
      setFormData({ code: '', type: 'DISCOUNT', discountPercentage: '', discountAmount: '', expiryDate: '', usageLimit: '1', description: '' });
      loadCodes();
    } catch (error) {
      console.error('Failed to create code:', error);
      alert('Failed to create code');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this code?')) return;
    try {
      await apiRequest(`/codes/${id}`, { method: 'DELETE' });
      loadCodes();
    } catch (error) {
      console.error('Failed to delete code:', error);
      alert('Failed to delete code');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Codes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Create Code'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-4">Create New Code</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full p-2 border rounded"
                placeholder="PROMO2024"
              />
            </div>
            <div>
              <label className="block mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="DISCOUNT">Discount</option>
                <option value="PROMO">Promo</option>
                <option value="REFERRAL">Referral</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Discount %</label>
              <input
                type="number"
                value={formData.discountPercentage}
                onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                className="w-full p-2 border rounded"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block mb-1">Discount Amount</label>
              <input
                type="number"
                value={formData.discountAmount}
                onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>
            <div>
              <label className="block mb-1">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Usage Limit *</label>
              <input
                type="number"
                required
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                className="w-full p-2 border rounded"
                min="1"
              />
            </div>
            <div className="col-span-2">
              <label className="block mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
          </div>
          <button type="submit" className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Create Code
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Code</th>
              <th className="border p-2 text-left">Type</th>
              <th className="border p-2 text-left">Discount</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Usage</th>
              <th className="border p-2 text-left">Expiry</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 ? (
              <tr>
                <td colSpan={7} className="border p-4 text-center text-gray-500">
                  No codes found
                </td>
              </tr>
            ) : (
              codes.map((code) => (
                <tr key={code._id}>
                  <td className="border p-2 font-mono">{code.code}</td>
                  <td className="border p-2">{code.type}</td>
                  <td className="border p-2">
                    {code.discountPercentage ? `${code.discountPercentage}%` : code.discountAmount ? `$${code.discountAmount}` : '-'}
                  </td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded text-xs ${code.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {code.status}
                    </span>
                  </td>
                  <td className="border p-2">{code.usageCount} / {code.usageLimit}</td>
                  <td className="border p-2">{code.expiryDate ? new Date(code.expiryDate).toLocaleDateString() : '-'}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleDelete(code._id)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
