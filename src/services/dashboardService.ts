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

export async function exportAllDataToExcel(userId: string) {
  try {
    const XLSX = await import('xlsx');

    const [
      materialsResult,
      materialCategoriesResult,
      inventoryResult,
      inventoryCategoriesResult,
      productsResult,
      productCategoriesResult,
      clientsResult,
      suppliersResult,
      supplierCategoriesResult,
      ordersResult,
    ] = await Promise.all([
      supabase.from('materials').select('*').eq('user_id', userId),
      supabase.from('material_categories').select('*').eq('user_id', userId),
      supabase.from('inventory').select('*').eq('user_id', userId),
      supabase.from('inventory_categories').select('*').eq('user_id', userId),
      supabase.from('products').select('*').eq('user_id', userId),
      supabase.from('product_categories').select('*').eq('user_id', userId),
      supabase.from('clients').select('*').eq('user_id', userId),
      supabase.from('suppliers').select('*').eq('user_id', userId),
      supabase.from('supplier_categories').select('*').eq('user_id', userId),
      supabase.from('orders').select('*').eq('user_id', userId),
    ]);

    const workbook = XLSX.utils.book_new();

    if (materialsResult.data && materialsResult.data.length > 0) {
      const materialsData = materialsResult.data.map((item) => {
        const category = materialCategoriesResult.data?.find(
          (cat) => cat.id === item.category_id
        );
        return {
          'Название': item.name,
          'Категория': category?.name || 'Без категории',
          'Поставщик': item.supplier,
          'Способ доставки': item.delivery_method,
          'Цена закупки (руб.)': item.purchase_price,
          'Начальный объем': item.initial_volume,
          'Остаток': item.remaining_volume,
          'Ед. измерения': item.unit_of_measurement,
          'Дата закупки': item.purchase_date,
        };
      });
      const materialsSheet = XLSX.utils.json_to_sheet(materialsData);
      XLSX.utils.book_append_sheet(workbook, materialsSheet, 'Материалы');
    }

    if (inventoryResult.data && inventoryResult.data.length > 0) {
      const inventoryData = inventoryResult.data.map((item) => {
        const category = inventoryCategoriesResult.data?.find(
          (cat) => cat.id === item.category_id
        );
        return {
          'Название': item.name,
          'Категория': category?.name || 'Без категории',
          'Цена покупки (руб.)': item.purchase_price,
          'Износ (%)': item.wear_percentage,
          'Износ на изделие (%)': item.wear_rate_per_item,
          'Дата покупки': item.purchase_date,
        };
      });
      const inventorySheet = XLSX.utils.json_to_sheet(inventoryData);
      XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Инвентарь');
    }

    if (productsResult.data && productsResult.data.length > 0) {
      const productsData = productsResult.data.map((item) => {
        const category = productCategoriesResult.data?.find(
          (cat) => cat.id === item.category_id
        );
        return {
          'Название': item.name,
          'Категория': category?.name || 'Без категории',
          'Описание': item.description,
          'Состав': item.composition,
          'Создано (шт)': item.quantity_created,
          'Остаток (шт)': item.remaining_quantity,
          'Трудочасов': item.labor_hours_per_item,
          'Себестоимость (руб.)': item.cost_price_per_item,
          'Цена продажи (руб.)': item.selling_price,
        };
      });
      const productsSheet = XLSX.utils.json_to_sheet(productsData);
      XLSX.utils.book_append_sheet(workbook, productsSheet, 'Изделия');
    }

    if (clientsResult.data && clientsResult.data.length > 0) {
      const clientsData = clientsResult.data.map((item) => ({
        'Полное имя': item.full_name,
        'Телефон': item.phone,
        'Соц. сеть': item.social_link,
        'Адрес': item.address,
        'Дата рождения': item.birth_date,
        'Метка': item.tag_name,
      }));
      const clientsSheet = XLSX.utils.json_to_sheet(clientsData);
      XLSX.utils.book_append_sheet(workbook, clientsSheet, 'Клиенты');
    }

    if (suppliersResult.data && suppliersResult.data.length > 0) {
      const suppliersData = suppliersResult.data.map((item) => {
        const category = supplierCategoriesResult.data?.find(
          (cat) => cat.id === item.category_id
        );
        return {
          'Название': item.name,
          'Категория': category?.name || 'Без категории',
          'Способ доставки': item.delivery_method,
          'Цена доставки (руб.)': item.delivery_price,
        };
      });
      const suppliersSheet = XLSX.utils.json_to_sheet(suppliersData);
      XLSX.utils.book_append_sheet(workbook, suppliersSheet, 'Поставщики');
    }

    if (ordersResult.data && ordersResult.data.length > 0) {
      const ordersWithDetails = await Promise.all(
        ordersResult.data.map(async (order) => {
          const { data: client } = await supabase
            .from('clients')
            .select('full_name')
            .eq('id', order.client_id || '')
            .maybeSingle();

          return {
            'Номер заказа': order.order_number,
            'Клиент': client?.full_name || 'Без клиента',
            'Дата заказа': order.order_date,
            'Срок': order.deadline,
            'Источник': order.source,
            'Доставка': order.delivery,
            'Статус': order.status,
            'Тип бонуса': order.bonus_type,
            'Скидка': order.discount_value,
            'Цена (руб.)': order.total_price,
          };
        })
      );
      const ordersSheet = XLSX.utils.json_to_sheet(ordersWithDetails);
      XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Заказы');
    }

    if (materialCategoriesResult.data && materialCategoriesResult.data.length > 0) {
      const categoriesData = materialCategoriesResult.data.map((item) => {
        const parent = materialCategoriesResult.data.find(
          (cat) => cat.id === item.parent_id
        );
        return {
          'Название': item.name,
          'Родительская категория': parent?.name || 'Нет',
        };
      });
      const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData);
      XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Категории материалов');
    }

    if (inventoryCategoriesResult.data && inventoryCategoriesResult.data.length > 0) {
      const categoriesData = inventoryCategoriesResult.data.map((item) => {
        const parent = inventoryCategoriesResult.data.find(
          (cat) => cat.id === item.parent_id
        );
        return {
          'Название': item.name,
          'Родительская категория': parent?.name || 'Нет',
        };
      });
      const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData);
      XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Категории инвентаря');
    }

    if (productCategoriesResult.data && productCategoriesResult.data.length > 0) {
      const categoriesData = productCategoriesResult.data.map((item) => {
        const parent = productCategoriesResult.data.find(
          (cat) => cat.id === item.parent_id
        );
        return {
          'Название': item.name,
          'Родительская категория': parent?.name || 'Нет',
          'Затраты на свет (руб.)': item.energy_costs_electricity,
          'Затраты на воду (руб.)': item.energy_costs_water,
        };
      });
      const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData);
      XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Категории изделий');
    }

    if (supplierCategoriesResult.data && supplierCategoriesResult.data.length > 0) {
      const categoriesData = supplierCategoriesResult.data.map((item) => {
        const parent = supplierCategoriesResult.data.find(
          (cat) => cat.id === item.parent_id
        );
        return {
          'Название': item.name,
          'Родительская категория': parent?.name || 'Нет',
        };
      });
      const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData);
      XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Категории поставщиков');
    }

    const fileName = `Master_Owl_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error exporting data:', error);
    return { success: false, error };
  }
}
