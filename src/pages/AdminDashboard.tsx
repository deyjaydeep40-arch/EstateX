/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Property, ContactMessage } from '../types';
import { Shield, Plus, Edit2, Trash2, MessageSquare, Clipboard, Sparkles, MapPin, DollarSign, Building, AlertCircle, FileText, Check, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminDashboard: React.FC = () => {
  const { user, token, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'listings' | 'inquiries' | 'form'>('listings');
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<ContactMessage[]>([]);
  
  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    city: 'Los Angeles',
    bedrooms: '3',
    bathrooms: '2',
    area: '1800',
    type: 'buy' as 'buy' | 'rent',
    propertyType: 'house' as 'house' | 'apartment' | 'condo' | 'townhouse',
    imageUrl: '',
    featured: false,
    bullets: '' // Custom bullet inputs for AI description generator
  });

  // State loading & notices
  const [loadingList, setLoadingList] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Security Guard: Check authentication and administrator level
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login?redirect=/admin');
      } else if (!user.isAdmin) {
        navigate('/dashboard'); // client cannot view admin space
      }
    }
  }, [user, authLoading, navigate]);

  // Load properties list
  const loadProperties = async () => {
    setLoadingList(true);
    try {
      const data = await api.getProperties({ limit: 100 });
      setProperties(data.properties);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoadingList(false);
    }
  };

  // Load inquiries inbox
  const loadInquiries = async () => {
    setLoadingMsgs(true);
    try {
      const data = await api.getAllMessages();
      setInquiries(data);
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoadingMsgs(false);
    }
  };

  // Trigger loads based on active tab
  useEffect(() => {
    if (user && user.isAdmin) {
      if (activeTab === 'listings') loadProperties();
      if (activeTab === 'inquiries') loadInquiries();
    }
  }, [activeTab, user]);

  const handleEditClick = (property: Property) => {
    setEditingId(property.id);
    setForm({
      title: property.title,
      description: property.description,
      price: String(property.price),
      location: property.location,
      city: property.city,
      bedrooms: String(property.bedrooms),
      bathrooms: String(property.bathrooms),
      area: String(property.area),
      type: property.type,
      propertyType: property.propertyType,
      imageUrl: property.imageUrl,
      featured: !!property.featured,
      bullets: ''
    });
    setSuccessBanner(null);
    setErrorBanner(null);
    setActiveTab('form');
  };

  const handleAddNewClick = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      price: '',
      location: '',
      city: 'Los Angeles',
      bedrooms: '3',
      bathrooms: '2',
      area: '1800',
      type: 'buy',
      propertyType: 'house',
      imageUrl: '',
      featured: false,
      bullets: ''
    });
    setSuccessBanner(null);
    setErrorBanner(null);
    setActiveTab('form');
  };

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this property? This operation is permanent.')) return;
    try {
      await api.deleteProperty(id);
      setProperties(prev => prev.filter(p => p.id !== id));
      triggerBanner('success', 'Listing deleted successfully.');
    } catch (err: any) {
      triggerBanner('error', err.message || 'Failed to delete listing.');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Delete this client message?')) return;
    try {
      await api.deleteMessage(id);
      setInquiries(prev => prev.filter(m => m.id !== id));
      triggerBanner('success', 'Inquiry cleared from inbox.');
    } catch (err: any) {
      triggerBanner('error', err.message || 'Failed to delete inquiry.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingForm(true);
    setErrorBanner(null);

    const payload = {
      ...form,
      price: parseFloat(form.price),
      bedrooms: parseInt(form.bedrooms, 10),
      bathrooms: parseFloat(form.bathrooms),
      area: parseInt(form.area, 10)
    };

    try {
      if (editingId) {
        await api.updateProperty(editingId, payload);
        triggerBanner('success', 'Listing updated successfully.');
      } else {
        await api.createProperty(payload);
        triggerBanner('success', 'New luxury listing published successfully.');
      }
      setActiveTab('listings');
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to save property listing.');
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleAiDescribe = async () => {
    if (!form.title || !form.location) {
      setAiNotice({ type: 'error', text: 'Please fill in Title, City, and Location first so the AI can understand property context.' });
      return;
    }

    setAiGenerating(true);
    setAiNotice(null);

    try {
      const response = await api.aiDescribe({
        title: form.title,
        location: form.location,
        propertyType: form.propertyType,
        price: parseFloat(form.price) || 0,
        features: form.bullets
      });

      setForm(prev => ({
        ...prev,
        description: response.description
      }));
      setAiNotice({ type: 'success', text: 'AI marketing description generated successfully!' });
    } catch (err: any) {
      setAiNotice({ 
        type: 'error', 
        text: err.message || 'AI copywriter failed. Check if GEMINI_API_KEY is configured in your project secrets.' 
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const triggerBanner = (type: 'success' | 'error', text: string) => {
    if (type === 'success') {
      setSuccessBanner(text);
      setTimeout(() => setSuccessBanner(null), 4000);
    } else {
      setErrorBanner(text);
      setTimeout(() => setErrorBanner(null), 4000);
    }
  };

  if (authLoading || !user || !user.isAdmin) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      
      {/* Page Title */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">EstateX Executive Board</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">Admin Portal</h1>
        </div>

        <button
          onClick={handleAddNewClick}
          className="flex items-center space-x-1.5 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Listing</span>
        </button>
      </div>

      {/* Success/Error Alerts */}
      <AnimatePresence>
        {successBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex items-center space-x-2 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
          >
            <Check className="h-5 w-5" />
            <span>{successBanner}</span>
          </motion.div>
        )}
        {errorBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex items-center space-x-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400"
          >
            <ShieldAlert className="h-5 w-5" />
            <span>{errorBanner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation links */}
      <div className="flex border-b border-neutral-100 dark:border-neutral-800 mb-8">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex items-center space-x-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'listings'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
          }`}
        >
          <Clipboard className="h-4.5 w-4.5" />
          <span>Active Listings ({properties.length})</span>
        </button>
        
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center space-x-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'inquiries'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
          }`}
        >
          <MessageSquare className="h-4.5 w-4.5" />
          <span>Client Inquiries ({inquiries.length})</span>
        </button>

        {activeTab === 'form' && (
          <div className="flex items-center space-x-2 border-b-2 border-blue-600 px-6 py-3.5 text-sm font-semibold text-blue-600 dark:text-blue-400">
            <FileText className="h-4.5 w-4.5" />
            <span>{editingId ? 'Edit Listing Specs' : 'Publish New Listing'}</span>
          </div>
        )}
      </div>

      {/* View Panels */}
      <div>
        
        {/* Listings panel */}
        {activeTab === 'listings' && (
          <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm dark:border-neutral-850 dark:bg-neutral-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:border-neutral-800 dark:bg-neutral-950/20">
                    <th className="px-6 py-4">Property</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Specs</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50 text-xs">
                  {loadingList ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-neutral-400">
                        <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : properties.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-neutral-400 font-semibold">
                        No property listings found. Click "Add New Listing" to publish.
                      </td>
                    </tr>
                  ) : (
                    properties.map((property) => (
                      <tr key={property.id} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-950/10 transition-colors">
                        <td className="px-6 py-4.5 font-semibold text-neutral-900 dark:text-white max-w-[200px] truncate">
                          <div className="flex items-center space-x-3">
                            <img src={property.imageUrl} alt="" className="h-8 w-12 object-cover rounded bg-neutral-100 dark:bg-neutral-800" referrerPolicy="no-referrer" />
                            <span className="truncate">{property.title}</span>
                            {property.featured && (
                              <span className="rounded bg-blue-50 px-1 py-0.5 text-[8px] font-bold text-blue-600 dark:bg-blue-950/30">PREM</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4.5 text-neutral-500 dark:text-neutral-400 max-w-[150px] truncate">{property.location}</td>
                        <td className="px-6 py-4.5">
                          <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            property.type === 'buy' 
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20' 
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                          }`}>
                            {property.type}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 font-bold font-mono text-neutral-800 dark:text-neutral-200">
                          ${property.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4.5 text-neutral-500">
                          {property.bedrooms}bds • {property.bathrooms}ba • {property.area}sqft
                        </td>
                        <td className="px-6 py-4.5 text-right space-x-2">
                          <button
                            onClick={() => handleEditClick(property)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:text-blue-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
                            title="Edit specs"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(property.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:text-red-500 hover:bg-red-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-red-950/20 cursor-pointer"
                            title="Delete listing"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inquiries inbox panel */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            {loadingMsgs ? (
              <div className="h-24 w-full animate-pulse bg-white border border-neutral-100 rounded-xl dark:bg-neutral-900" />
            ) : inquiries.length === 0 ? (
              <div className="flex h-[30vh] flex-col items-center justify-center text-center bg-white rounded-2xl border border-neutral-100 dark:border-neutral-850 dark:bg-neutral-900 p-6">
                <MessageSquare className="h-8 w-8 text-neutral-300 mb-2.5" />
                <h3 className="font-display text-base font-bold text-neutral-800 dark:text-neutral-200">No Inquiries Found</h3>
                <p className="text-xs text-neutral-400">Client scheduling inquiries will appear here.</p>
              </div>
            ) : (
              inquiries.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-xl border border-neutral-100 bg-white p-5 dark:border-neutral-850 dark:bg-neutral-900 shadow-sm flex flex-col sm:flex-row justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2.5 mb-2.5">
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">Direct Viewing Request</span>
                      <span className="text-[10px] text-neutral-400">{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>

                    <h4 className="font-display text-base font-bold text-neutral-900 dark:text-white">
                      Inquiry for:{' '}
                      <Link to={`/properties/${msg.propertyId}`} className="text-blue-600 hover:underline">
                        {msg.propertyName || 'Property spec details'}
                      </Link>
                    </h4>
                    
                    <blockquote className="mt-3 border-l-2 border-neutral-100 pl-3 text-xs italic text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                      "{msg.message}"
                    </blockquote>

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-neutral-400 border-t border-neutral-50 pt-3 dark:border-neutral-800">
                      <span><strong>Contact Name:</strong> {msg.name}</span>
                      <span><strong>Email:</strong> {msg.email}</span>
                      <span><strong>Phone Callbacks:</strong> {msg.phone}</span>
                    </div>
                  </div>

                  <div className="self-start sm:self-center">
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:border-neutral-800 dark:text-neutral-400 cursor-pointer"
                      title="Clear message"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Listing Form panel (Create / Edit) */}
        {activeTab === 'form' && (
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-850 dark:bg-neutral-900 max-w-4xl">
            <h3 className="font-display text-lg font-bold text-neutral-950 dark:text-white mb-6 border-b border-neutral-50 pb-3 dark:border-neutral-800">
              {editingId ? 'Modify Listing Specifications' : 'Publish an Estate Listing'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* Row 1: Title & Featured */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="mb-1 block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Property Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3.5 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                    placeholder="The Malibu Crest Cliffside Villa"
                  />
                </div>
                
                <div className="flex items-center mt-6">
                  <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="h-4.5 w-4.5 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Premium / Featured</span>
                  </label>
                </div>
              </div>

              {/* Row 2: Location, City */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Street Address & State</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-3.5 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                      placeholder="1042 Ocean Blvd, Malibu, CA"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Target Region / City</label>
                  <select
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3.5 text-xs text-neutral-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                  >
                    <option value="Los Angeles">Los Angeles</option>
                    <option value="Malibu">Malibu</option>
                    <option value="New York">New York</option>
                    <option value="Aspen">Aspen</option>
                    <option value="Miami">Miami</option>
                    <option value="San Francisco">San Francisco</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Price, Bedrooms, Bathrooms, Area */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">$</span>
                    <input
                      type="number"
                      required
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-7 pr-3.5 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                      placeholder="4500000"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Bedrooms</label>
                  <input
                    type="number"
                    required
                    value={form.bedrooms}
                    onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3.5 text-xs text-neutral-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                    placeholder="4"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Bathrooms</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={form.bathrooms}
                    onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3.5 text-xs text-neutral-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                    placeholder="4.5"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Area (sq ft)</label>
                  <input
                    type="number"
                    required
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3.5 text-xs text-neutral-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                    placeholder="5400"
                  />
                </div>
              </div>

              {/* Row 4: Transaction Type, Home Type, Image URL */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Listing Contract</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3.5 text-xs text-neutral-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                  >
                    <option value="buy">For Sale (Buy)</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Architectural Shape</label>
                  <select
                    value={form.propertyType}
                    onChange={(e) => setForm({ ...form, propertyType: e.target.value as any })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3.5 text-xs text-neutral-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                  >
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Primary Image URL</label>
                  <input
                    type="url"
                    required
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3.5 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>
              </div>

              {/* Gemini AI Copilot describe assistant (Masterpiece integration!) */}
              <div className="rounded-2xl border border-blue-50 bg-blue-50/15 p-4.5 dark:border-neutral-800 dark:bg-neutral-950/40 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4.5 w-4.5 text-blue-600 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Gemini AI Marketing Assistant</span>
                  </div>
                  <button
                    type="button"
                    disabled={aiGenerating}
                    onClick={handleAiDescribe}
                    className="flex items-center space-x-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm hover:bg-blue-500 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <span>{aiGenerating ? 'AI Writing...' : '✨ AI Generate Copy'}</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Bullets/Unique Features (Optional for AI)</label>
                    <input
                      type="text"
                      value={form.bullets}
                      onChange={(e) => setForm({ ...form, bullets: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 bg-white py-2 px-3 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                      placeholder="e.g. infinity pool, floor to ceiling glass, quartz counters"
                    />
                  </div>
                  <div className="flex items-center">
                    <p className="text-[10px] text-neutral-400 leading-relaxed">
                      Write bullet points of key features, and let Gemini construct elegant copy.
                    </p>
                  </div>
                </div>

                {aiNotice && (
                  <div className={`text-xs font-semibold flex items-center space-x-1.5 ${aiNotice.type === 'success' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{aiNotice.text}</span>
                  </div>
                )}
              </div>

              {/* Description text block */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Property Description</label>
                <textarea
                  rows={6}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3.5 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 resize-none"
                  placeholder="Enter a description or use the Gemini AI generator above."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 border-t border-neutral-50 pt-5 dark:border-neutral-800">
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submittingForm ? 'Saving Listing Specs...' : editingId ? 'Update Specs' : 'Publish Listing'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('listings')}
                  className="rounded-xl border border-neutral-200 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        )}

      </div>

    </div>
  );
};
