'use client'

import { useState, useEffect } from 'react'
import { supabase, WaitlistEntry } from '@/lib/supabase'
import { Mail, Users, Clock, CheckCircle, Newspaper, LogOut } from 'lucide-react'
import AdminLogin from '@/components/AdminLogin'

interface Subscriber {
  id: string
  email: string
  status: 'active' | 'inactive' | 'unsubscribed'
  subscription_type: 'weekly' | 'daily' | 'monthly'
  created_at: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'waitlist' | 'subscribers'>('waitlist')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [waitlistStats, setWaitlistStats] = useState({
    total: 0,
    pending: 0,
    notified: 0,
    converted: 0
  })
  const [subscriberStats, setSubscriberStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    unsubscribed: 0
  })

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      const storedUser = localStorage.getItem('vela_admin_user')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          setCurrentUser(user)
          setIsAuthenticated(true)
          fetchData()
        } catch {
          localStorage.removeItem('vela_admin_user')
        }
      } else {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  const handleLogin = (user: any) => {
    setCurrentUser(user)
    setIsAuthenticated(true)
    localStorage.setItem('vela_admin_user', JSON.stringify(user))
    fetchData()
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('vela_admin_user')
  }

  const fetchData = async () => {
    try {
      setError('')
      setLoading(true)

      // Fetch waitlist entries
      const { data: waitlistData, error: waitlistError } = await supabase
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: false })

      if (waitlistError) {
        console.error('Waitlist error:', waitlistError)
        throw new Error(`Waitlist error: ${waitlistError.message}`)
      }

      // Fetch subscribers
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false })

      if (subscribersError) {
        console.error('Subscribers error:', subscribersError)
        throw new Error(`Subscribers error: ${subscribersError.message}`)
      }

      setWaitlistEntries(waitlistData || [])
      setSubscribers(subscribersData || [])

      // Calculate waitlist stats
      const total = waitlistData?.length || 0
      const pending = waitlistData?.filter(entry => entry.status === 'pending').length || 0
      const notified = waitlistData?.filter(entry => entry.status === 'notified').length || 0
      const converted = waitlistData?.filter(entry => entry.status === 'converted').length || 0

      setWaitlistStats({ total, pending, notified, converted })

      // Calculate subscriber stats
      const subTotal = subscribersData?.length || 0
      const active = subscribersData?.filter(sub => sub.status === 'active').length || 0
      const inactive = subscribersData?.filter(sub => sub.status === 'inactive').length || 0
      const unsubscribed = subscribersData?.filter(sub => sub.status === 'unsubscribed').length || 0

      setSubscriberStats({ total: subTotal, active, inactive, unsubscribed })
    } catch (error) {
      console.error('Error fetching data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const updateWaitlistStatus = async (id: string, newStatus: 'pending' | 'notified' | 'converted') => {
    try {
      setUpdatingId(id)
      const { error } = await supabase
        .from('waitlist')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      
      fetchData() // Refresh data
    } catch (error) {
      console.error('Error updating waitlist status:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const updateSubscriberStatus = async (id: string, newStatus: 'active' | 'inactive' | 'unsubscribed') => {
    try {
      setUpdatingId(id)
      const { error } = await supabase
        .from('subscribers')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      
      fetchData() // Refresh data
    } catch (error) {
      console.error('Error updating subscriber status:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Loading data...</p>
          <p className="text-gray-500 text-sm mt-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Fetching waitlist and subscribers</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Connection Error</h2>
          <p className="text-gray-600 mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>{error}</p>
          <div className="space-y-3">
            <button 
              onClick={fetchData}
              className="w-full px-6 py-3 text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#9046ff', fontFamily: 'Manrope, sans-serif' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#7c3aed'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#9046ff'
              }}
            >
              Try Again
            </button>
            <p className="text-sm text-gray-500" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Make sure the database tables are created in Supabase
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Vela Admin Dashboard</h1>
            <p className="text-gray-600" style={{ fontFamily: 'Manrope, sans-serif' }}>Manage waitlist entries and newsletter subscribers</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Welcome, {currentUser?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('waitlist')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'waitlist'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Waitlist ({waitlistStats.total})
              </button>
              <button
                onClick={() => setActiveTab('subscribers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'subscribers'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Newsletter ({subscriberStats.total})
              </button>
            </nav>
          </div>
        </div>

        {/* Waitlist Tab */}
        {activeTab === 'waitlist' && (
          <>
            {/* Waitlist Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8" style={{ color: '#9046ff' }} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Manrope, sans-serif' }}>Total Signups</p>
                    <p className="text-2xl font-bold text-gray-900">{waitlistStats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Manrope, sans-serif' }}>Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{waitlistStats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Mail className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Manrope, sans-serif' }}>Notified</p>
                    <p className="text-2xl font-bold text-gray-900">{waitlistStats.notified}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8" style={{ color: '#9046ff' }} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Manrope, sans-serif' }}>Converted</p>
                    <p className="text-2xl font-bold text-gray-900">{waitlistStats.converted}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Waitlist Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Waitlist Entries</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {waitlistEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                          {entry.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ fontFamily: 'Manrope, sans-serif' }}>
                          {entry.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            entry.status === 'notified' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`} style={{ fontFamily: 'Manrope, sans-serif' }}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ fontFamily: 'Manrope, sans-serif' }}>
                          {new Date(entry.created_at || '').toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            {entry.status === 'pending' && (
                              <button
                                onClick={() => updateWaitlistStatus(entry.id!, 'notified')}
                                disabled={updatingId === entry.id}
                                className="text-green-600 hover:text-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                style={{ fontFamily: 'Manrope, sans-serif' }}
                              >
                                {updatingId === entry.id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Updating...
                                  </>
                                ) : (
                                  'Mark Notified'
                                )}
                              </button>
                            )}
                            {entry.status === 'notified' && (
                              <button
                                onClick={() => updateWaitlistStatus(entry.id!, 'converted')}
                                disabled={updatingId === entry.id}
                                className="text-purple-600 hover:text-purple-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                style={{ fontFamily: 'Manrope, sans-serif' }}
                              >
                                {updatingId === entry.id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Updating...
                                  </>
                                ) : (
                                  'Mark Converted'
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {waitlistEntries.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>No waitlist entries yet</h3>
                <p className="text-gray-500" style={{ fontFamily: 'Manrope, sans-serif' }}>Entries will appear here once people start joining the waitlist.</p>
              </div>
            )}
          </>
        )}

        {/* Subscribers Tab */}
        {activeTab === 'subscribers' && (
          <>
            {/* Subscriber Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Newspaper className="w-8 h-8" style={{ color: '#9046ff' }} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Manrope, sans-serif' }}>Total Subscribers</p>
                    <p className="text-2xl font-bold text-gray-900">{subscriberStats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Manrope, sans-serif' }}>Active</p>
                    <p className="text-2xl font-bold text-gray-900">{subscriberStats.active}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Manrope, sans-serif' }}>Inactive</p>
                    <p className="text-2xl font-bold text-gray-900">{subscriberStats.inactive}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Mail className="w-8 h-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Manrope, sans-serif' }}>Unsubscribed</p>
                    <p className="text-2xl font-bold text-gray-900">{subscriberStats.unsubscribed}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscribers Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Newsletter Subscribers</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Subscribed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                          {subscriber.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            subscriber.status === 'active' ? 'bg-green-100 text-green-800' :
                            subscriber.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`} style={{ fontFamily: 'Manrope, sans-serif' }}>
                            {subscriber.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ fontFamily: 'Manrope, sans-serif' }}>
                          {subscriber.subscription_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ fontFamily: 'Manrope, sans-serif' }}>
                          {new Date(subscriber.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            {subscriber.status === 'active' && (
                              <button
                                onClick={() => updateSubscriberStatus(subscriber.id, 'inactive')}
                                disabled={updatingId === subscriber.id}
                                className="text-yellow-600 hover:text-yellow-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                style={{ fontFamily: 'Manrope, sans-serif' }}
                              >
                                {updatingId === subscriber.id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Updating...
                                  </>
                                ) : (
                                  'Deactivate'
                                )}
                              </button>
                            )}
                            {subscriber.status === 'inactive' && (
                              <button
                                onClick={() => updateSubscriberStatus(subscriber.id, 'active')}
                                disabled={updatingId === subscriber.id}
                                className="text-green-600 hover:text-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                style={{ fontFamily: 'Manrope, sans-serif' }}
                              >
                                {updatingId === subscriber.id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Updating...
                                  </>
                                ) : (
                                  'Activate'
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => updateSubscriberStatus(subscriber.id, 'unsubscribed')}
                              disabled={updatingId === subscriber.id}
                              className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                              style={{ fontFamily: 'Manrope, sans-serif' }}
                            >
                              {updatingId === subscriber.id ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Updating...
                                </>
                              ) : (
                                'Unsubscribe'
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {subscribers.length === 0 && (
              <div className="text-center py-12">
                <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>No subscribers yet</h3>
                <p className="text-gray-500" style={{ fontFamily: 'Manrope, sans-serif' }}>Subscribers will appear here once people start subscribing to the newsletter.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}