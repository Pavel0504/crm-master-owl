import { supabase } from '../lib/supabase';

export interface Order {
  id: string;
  user_id: string;
  order_number: number;
  client_id: string | null;
  order_date: string;
  deadline: string | null;
  source: string;
  delivery: string;
  status: string;
  bonus_type: string;
  discount_type: string;
  discount_value: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  is_bonus: boolean;
}

export interface OrderItemInput {
  product_id: string;
  quantity: number;
  is_bonus: boolean;
}

export interface OrderInput {
  client_id?: string | null;
  order_date?: string;
  deadline?: string | null;
  source?: string;
  delivery?: string;
  status?: string;
  bonus_type?: string;
  discount_type?: string;
  discount_value?: number;
  items: OrderItemInput[];
}

export interface OrderWithItems extends Order {
  items: Array<{
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    is_bonus: boolean;
    price: number;
  }>;
  client_name?: string;
}

export async function getOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('order_number', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getOrderById(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getOrderItems(orderId: string) {
  const { data, error } = await supabase
    .from('order_items')
    .select('id, product_id, quantity, is_bonus')
    .eq('order_id', orderId);

  if (error) {
    console.error('Error fetching order items:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getOrderWithDetails(orderId: string) {
  const { data: order, error: orderError } = await getOrderById(orderId);

  if (orderError || !order) {
    return { data: null, error: orderError };
  }

  const { data: items, error: itemsError } = await getOrderItems(orderId);

  if (itemsError) {
    return { data: null, error: itemsError };
  }

  const itemsWithDetails = await Promise.all(
    (items || []).map(async (item) => {
      const { data: product } = await supabase
        .from('products')
        .select('name, selling_price')
        .eq('id', item.product_id)
        .single();

      return {
        ...item,
        product_name: product?.name || 'Неизвестное изделие',
        price: product?.selling_price || 0,
      };
    })
  );

  let client_name: string | undefined;
  if (order.client_id) {
    const { data: client } = await supabase
      .from('clients')
      .select('full_name')
      .eq('id', order.client_id)
      .single();

    client_name = client?.full_name;
  }

  return {
    data: {
      ...order,
      items: itemsWithDetails,
      client_name,
    } as OrderWithItems,
    error: null,
  };
}

export function calculateTimeRemaining(orderDate: string, deadline: string | null): number {
  if (!deadline) return 0;

  const start = new Date(orderDate).getTime();
  const end = new Date(deadline).getTime();
  const now = new Date().getTime();

  if (now >= end) return 0;
  if (now <= start) return 100;

  const totalTime = end - start;
  const remainingTime = end - now;

  return Math.round((remainingTime / totalTime) * 100);
}

export async function calculateOrderPrice(
  items: OrderItemInput[],
  bonusType: string,
  discountType: string,
  discountValue: number
): Promise<{ totalPrice: number; error: Error | null }> {
  let basePrice = 0;

  for (const item of items) {
    if (item.is_bonus) continue;

    const { data: product, error } = await supabase
      .from('products')
      .select('selling_price')
      .eq('id', item.product_id)
      .single();

    if (error || !product) {
      console.error('Error fetching product for price calculation:', error);
      continue;
    }

    basePrice += product.selling_price * item.quantity;
  }

  let finalPrice = basePrice;

  if (bonusType === 'скидка' && discountValue > 0) {
    if (discountType === 'процент') {
      finalPrice = basePrice * (1 - discountValue / 100);
    } else if (discountType === 'сумма') {
      finalPrice = basePrice - discountValue;
    }
  }

  finalPrice = Math.max(0, finalPrice);

  return { totalPrice: finalPrice, error: null };
}

export async function createOrder(userId: string, orderData: OrderInput) {
  for (const item of orderData.items) {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('remaining_quantity')
      .eq('id', item.product_id)
      .single();

    if (productError || !product) {
      return {
        data: null,
        error: new Error(`Не удалось найти изделие ${item.product_id}`),
      };
    }

    if (product.remaining_quantity < item.quantity) {
      return {
        data: null,
        error: new Error(
          `Недостаточно изделий (доступно: ${product.remaining_quantity}, требуется: ${item.quantity})`
        ),
      };
    }
  }

  const { totalPrice } = await calculateOrderPrice(
    orderData.items,
    orderData.bonus_type || 'нет',
    orderData.discount_type || 'процент',
    orderData.discount_value || 0
  );

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      order_number: 0,
      client_id: orderData.client_id,
      order_date: orderData.order_date || new Date().toISOString().split('T')[0],
      deadline: orderData.deadline,
      source: orderData.source || '',
      delivery: orderData.delivery || '',
      status: orderData.status || 'В процессе',
      bonus_type: orderData.bonus_type || 'нет',
      discount_type: orderData.discount_type || 'процент',
      discount_value: orderData.discount_value || 0,
      total_price: totalPrice,
    })
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    return { data: null, error: orderError };
  }

  for (const item of orderData.items) {
    const { error: itemError } = await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      is_bonus: item.is_bonus,
    });

    if (itemError) {
      console.error('Error creating order item:', itemError);
      return { data: null, error: itemError };
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({
        remaining_quantity: supabase.raw(`remaining_quantity - ${item.quantity}`),
      })
      .eq('id', item.product_id);

    if (updateError) {
      console.error('Error updating product quantity:', updateError);
    }
  }

  return { data: order, error: null };
}

export async function updateOrder(
  orderId: string,
  orderData: Partial<OrderInput>
) {
  const updates: any = {};

  if (orderData.client_id !== undefined) updates.client_id = orderData.client_id;
  if (orderData.order_date !== undefined) updates.order_date = orderData.order_date;
  if (orderData.deadline !== undefined) updates.deadline = orderData.deadline;
  if (orderData.source !== undefined) updates.source = orderData.source;
  if (orderData.delivery !== undefined) updates.delivery = orderData.delivery;
  if (orderData.status !== undefined) updates.status = orderData.status;
  if (orderData.bonus_type !== undefined) updates.bonus_type = orderData.bonus_type;
  if (orderData.discount_type !== undefined) updates.discount_type = orderData.discount_type;
  if (orderData.discount_value !== undefined) updates.discount_value = orderData.discount_value;

  if (orderData.items) {
    const { data: existingOrder } = await getOrderById(orderId);

    if (existingOrder) {
      const { totalPrice } = await calculateOrderPrice(
        orderData.items,
        orderData.bonus_type || existingOrder.bonus_type,
        orderData.discount_type || existingOrder.discount_type,
        orderData.discount_value !== undefined
          ? orderData.discount_value
          : existingOrder.discount_value
      );

      updates.total_price = totalPrice;
    }
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteOrder(orderId: string) {
  const { error } = await supabase.from('orders').delete().eq('id', orderId);

  if (error) {
    console.error('Error deleting order:', error);
    return { error };
  }

  return { error: null };
}
