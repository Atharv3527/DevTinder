import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';

const ConnectionContext = createContext();
const API = import.meta.env.VITE_API_URL || 'https://devtinder-1-euv2.onrender.com';

export function ConnectionProvider({ children }) {
  const { isAuthenticated, user, getToken } = useAuth();
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    if (!isAuthenticated || !user) {
      setConnections([]);
      setPendingRequests([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const token = await getToken();
      
      const [connRes, pendingRes] = await Promise.all([
        axios.get(`${API}/api/connections`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/connections/pending`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setConnections(connRes.data.connections || []);
      setPendingRequests(pendingRes.data.requests || []);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    // Subscribe to connections table changes
    const fetchFresh = () => fetchConnections();

    const channelReceiver = supabase
      .channel('connections_receiver')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'connections', filter: `receiver_id=eq.${user.uid}` },
        fetchFresh
      )
      .subscribe();

    const channelSender = supabase
      .channel('connections_sender')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'connections', filter: `sender_id=eq.${user.uid}` },
        fetchFresh
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelReceiver);
      supabase.removeChannel(channelSender);
    };
  }, [isAuthenticated, user]);

  return (
    <ConnectionContext.Provider value={{ connections, pendingRequests, loading, fetchConnections, setConnections, setPendingRequests }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export const useConnections = () => useContext(ConnectionContext);
