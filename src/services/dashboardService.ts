import { supabase } from '../lib/supabase';

export interface SalesData {
  period: string;
  sales: number;
  orders_count: number;
}

export interface ExpensesData {
  period: string;
  materials: number;
  inventory: number;
  total: number;
}

export interface MaterialExpensesByType {
  material_name: string;
  total_spent: number;
  category: string;
}

export interface ProfitData {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export type PeriodType = 'day' | 'week' | 'month' | 'year';

export async function getSalesData(
  userId: string,
  periodType: PeriodType,
  startDate?: string,
  endDate?: string
): Promise<{ data: SalesData[] | null; error: any }> {
  try {
    let query = supabase
      .from('orders')
      .select('order_date, total_price, status')
      .eq('user_id', userId)
      .neq('status', 'Отменен');

    if (startDate) {
      query = query.gte('order_date', startDate);
    }
    if (endDate) {
      query = query.lte('order_date', endDate);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching sales data:', error);
      return { data: null, error };
    }

    const groupedData = groupByPeriod(orders || [], periodType, 'order_date');
    const salesData: SalesData[] = Object.entries(groupedData).map(([period, items]) => ({
      period,
      sales: items.reduce((sum: number, item: any) => sum + (item.total_price || 0), 0),
      orders_count: items.length,
    }));

    return { data: salesData.sort((a, b) => a.period.localeCompare(b.period)), error: null };
  } catch (error) {
    console.error('Error in getSalesData:', error);
    return { data: null, error };
  }
}

export async function getExpensesData(
  userId: string,
  periodType: PeriodType,
  startDate?: string,
  endDate?: string
): Promise<{ data: ExpensesData[] | null; error: any }> {
  try {
    let materialsQuery = supabase
      .from('materials')
      .select('purchase_date, purchase_price')
      .eq('user_id', userId);

    let inventoryQuery = supabase
      .from('inventory')
      .select('purchase_date, purchase_price')
      .eq('user_id', userId);

    if (startDate) {
      materialsQuery = materialsQuery.gte('purchase_date', startDate);
      inventoryQuery = inventoryQuery.gte('purchase_date', startDate);
    }
    if (endDate) {
      materialsQuery = materialsQuery.lte('purchase_date', endDate);
      inventoryQuery = inventoryQuery.lte('purchase_date', endDate);
    }

    const [{ data: materials, error: matError }, { data: inventory, error: invError }] =
      await Promise.all([materialsQuery, inventoryQuery]);

    if (matError || invError) {
      console.error('Error fetching expenses data:', matError || invError);
      return { data: null, error: matError || invError };
    }

    const materialsByPeriod = groupByPeriod(materials || [], periodType, 'purchase_date');
    const inventoryByPeriod = groupByPeriod(inventory || [], periodType, 'purchase_date');

    const allPeriods = new Set([
      ...Object.keys(materialsByPeriod),
      ...Object.keys(inventoryByPeriod),
    ]);

    const expensesData: ExpensesData[] = Array.from(allPeriods).map((period) => {
      const materialsCost = (materialsByPeriod[period] || []).reduce(
        (sum: number, item: any) => sum + (item.purchase_price || 0),
        0
      );
      const inventoryCost = (inventoryByPeriod[period] || []).reduce(
        (sum: number, item: any) => sum + (item.purchase_price || 0),
        0
      );

      return {
        period,
        materials: materialsCost,
        inventory: inventoryCost,
        total: materialsCost + inventoryCost,
      };
    });

    return { data: expensesData.sort((a, b) => a.period.localeCompare(b.period)), error: null };
  } catch (error) {
    console.error('Error in getExpensesData:', error);
    return { data: null, error };
  }
}

export async function getMaterialExpensesByType(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<{ data: MaterialExpensesByType[] | null; error: any }> {
  try {
    let query = supabase
      .from('materials')
      .select('name, purchase_price, category_id, purchase_date')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('purchase_date', startDate);
    }
    if (endDate) {
      query = query.lte('purchase_date', endDate);
    }

    const { data: materials, error } = await query;

    if (error) {
      console.error('Error fetching material expenses:', error);
      return { data: null, error };
    }

    const { data: categories } = await supabase
      .from('material_categories')
      .select('id, name')
      .eq('user_id', userId);

    const categoryMap = new Map((categories || []).map((cat) => [cat.id, cat.name]));

    const groupedByName: Record<string, { total: number; category: string }> = {};

    (materials || []).forEach((material) => {
      if (!groupedByName[material.name]) {
        groupedByName[material.name] = {
          total: 0,
          category: material.category_id
            ? categoryMap.get(material.category_id) || 'Без категории'
            : 'Без категории',
        };
      }
      groupedByName[material.name].total += material.purchase_price;
    });

    const result: MaterialExpensesByType[] = Object.entries(groupedByName).map(
      ([name, data]) => ({
        material_name: name,
        total_spent: data.total,
        category: data.category,
      })
    );

    return { data: result.sort((a, b) => b.total_spent - a.total_spent), error: null };
  } catch (error) {
    console.error('Error in getMaterialExpensesByType:', error);
    return { data: null, error };
  }
}

export async function getProfitData(
  userId: string,
  periodType: PeriodType,
  startDate?: string,
  endDate?: string
): Promise<{ data: ProfitData[] | null; error: any }> {
  try {
    const [salesResult, expensesResult] = await Promise.all([
      getSalesData(userId, periodType, startDate, endDate),
      getExpensesData(userId, periodType, startDate, endDate),
    ]);

    if (salesResult.error || expensesResult.error) {
      return { data: null, error: salesResult.error || expensesResult.error };
    }

    const salesMap = new Map(
      (salesResult.data || []).map((item) => [item.period, item.sales])
    );
    const expensesMap = new Map(
      (expensesResult.data || []).map((item) => [item.period, item.total])
    );

    const allPeriods = new Set([...salesMap.keys(), ...expensesMap.keys()]);

    const profitData: ProfitData[] = Array.from(allPeriods).map((period) => {
      const revenue = salesMap.get(period) || 0;
      const expenses = expensesMap.get(period) || 0;

      return {
        period,
        revenue,
        expenses,
        profit: revenue - expenses,
      };
    });

    return { data: profitData.sort((a, b) => a.period.localeCompare(b.period)), error: null };
  } catch (error) {
    console.error('Error in getProfitData:', error);
    return { data: null, error };
  }
}

function groupByPeriod(
  items: any[],
  periodType: PeriodType,
  dateField: string
): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};

  items.forEach((item) => {
    const date = new Date(item[dateField]);
    let period: string;

    switch (periodType) {
      case 'day':
        period = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        period = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        period = String(date.getFullYear());
        break;
      default:
        period = date.toISOString().split('T')[0];
    }

    if (!grouped[period]) {
      grouped[period] = [];
    }
    grouped[period].push(item);
  });

  return grouped;
}

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert('Нет данных для экспорта');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
