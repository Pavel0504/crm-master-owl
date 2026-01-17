import { supabase } from '../lib/supabase';

export interface Client {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  social_link: string;
  address: string;
  birth_date: string | null;
  tag_name: string;
  tag_color: string;
  created_at: string;
  updated_at: string;
}

export interface ClientInput {
  full_name: string;
  phone?: string;
  social_link?: string;
  address?: string;
  birth_date?: string | null;
  tag_name?: string;
  tag_color?: string;
}

export interface ClientStats {
  orders_count: number;
  total_orders_sum: number;
}

export async function getClients(userId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clients:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getClientById(clientId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (error) {
    console.error('Error fetching client:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getClientStats(clientId: string): Promise<ClientStats> {
  const { data, error } = await supabase
    .from('orders')
    .select('total_price')
    .eq('client_id', clientId);

  if (error) {
    console.error('Error fetching client stats:', error);
    return { orders_count: 0, total_orders_sum: 0 };
  }

  const orders_count = data?.length || 0;
  const total_orders_sum = data?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;

  return { orders_count, total_orders_sum };
}

export async function getAllClientsStats(userId: string): Promise<Record<string, ClientStats>> {
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', userId);

  if (clientsError || !clients) {
    console.error('Error fetching clients for stats:', clientsError);
    return {};
  }

  const clientIds = clients.map((c) => c.id);

  if (clientIds.length === 0) {
    return {};
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('client_id, total_price')
    .in('client_id', clientIds);

  if (ordersError) {
    console.error('Error fetching orders for stats:', ordersError);
    return {};
  }

  const statsMap: Record<string, ClientStats> = {};

  clientIds.forEach((clientId) => {
    const clientOrders = orders?.filter((o) => o.client_id === clientId) || [];
    statsMap[clientId] = {
      orders_count: clientOrders.length,
      total_orders_sum: clientOrders.reduce((sum, order) => sum + (order.total_price || 0), 0),
    };
  });

  return statsMap;
}

export async function createClient(userId: string, clientData: ClientInput) {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      user_id: userId,
      ...clientData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating client:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updateClient(clientId: string, clientData: ClientInput) {
  const { data, error } = await supabase
    .from('clients')
    .update(clientData)
    .eq('id', clientId)
    .select()
    .single();

  if (error) {
    console.error('Error updating client:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteClient(clientId: string) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId);

  if (error) {
    console.error('Error deleting client:', error);
    return { error };
  }

  return { error: null };
}
