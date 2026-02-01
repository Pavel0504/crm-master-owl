import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Download,
  Calendar,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button, Select, DatePicker, FilterPanel } from '../components/ui';
import {
  getSalesData,
  getExpensesData,
  getMaterialExpensesByType,
  getProfitData,
  exportToCSV,
  exportAllDataToExcel,
  PeriodType,
  SalesData,
  ExpensesData,
  MaterialExpensesByType,
  ProfitData,
} from '../services/dashboardService';

const COLORS = ['#f97316', '#ef4444', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [expensesData, setExpensesData] = useState<ExpensesData[]>([]);
  const [materialExpenses, setMaterialExpenses] = useState<MaterialExpensesByType[]>([]);
  const [profitData, setProfitData] = useState<ProfitData[]>([]);

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    loadData();
  }, [user, periodType, startDate, endDate]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [salesResult, expensesResult, materialExpensesResult, profitResult] =
        await Promise.all([
          getSalesData(user.id, periodType, startDate, endDate),
          getExpensesData(user.id, periodType, startDate, endDate),
          getMaterialExpensesByType(user.id, startDate, endDate),
          getProfitData(user.id, periodType, startDate, endDate),
        ]);

      if (salesResult.error || expensesResult.error || profitResult.error) {
        setError('Не удалось загрузить статистику');
      } else {
        setSalesData(salesResult.data || []);
        setExpensesData(expensesResult.data || []);
        setMaterialExpenses(materialExpensesResult.data || []);
        setProfitData(profitResult.data || []);

        const revenue = (salesResult.data || []).reduce((sum, item) => sum + item.sales, 0);
        const expenses = (expensesResult.data || []).reduce((sum, item) => sum + item.total, 0);
        const orders = (salesResult.data || []).reduce((sum, item) => sum + item.orders_count, 0);

        setTotalRevenue(revenue);
        setTotalExpenses(expenses);
        setTotalProfit(revenue - expenses);
        setTotalOrders(orders);
      }
    } catch (err) {
      setError('Произошла ошибка при загрузке данных');
      console.error(err);
    }

    setLoading(false);
  };

  const handleExport = () => {
    const exportData = profitData.map((item) => ({
      Период: item.period,
      'Выручка (руб.)': item.revenue.toFixed(2),
      'Расходы (руб.)': item.expenses.toFixed(2),
      'Прибыль (руб.)': item.profit.toFixed(2),
    }));

    exportToCSV(exportData, 'dashboard_statistics');
  };

  const handleExportAllData = async () => {
    if (!user) return;

    setExportLoading(true);
    setError(null);

    const result = await exportAllDataToExcel(user.id);

    if (!result.success) {
      setError('Не удалось экспортировать данные');
    }

    setExportLoading(false);
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const periodOptions = [
    { value: 'day', label: 'По дням' },
    { value: 'week', label: 'По неделям' },
    { value: 'month', label: 'По месяцам' },
    { value: 'year', label: 'По годам' },
  ];

  const formatCurrency = (value: number) => `${value.toFixed(0)} ₽`;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 dark:text-burgundy-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 dark:from-burgundy-600 dark:to-burgundy-700 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Статистика</h1>
              <p className="text-gray-600 dark:text-gray-400">Аналитика и статистика</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={handleExport}
              className="flex items-center justify-center gap-2"
              disabled={profitData.length === 0}
            >
              <Download className="h-5 w-5" />
              Экспорт CSV
            </Button>
            <Button
              variant="primary"
              onClick={handleExportAllData}
              className="flex items-center justify-center gap-2"
              loading={exportLoading}
              disabled={exportLoading}
            >
              <Download className="h-5 w-5" />
              Экспорт данных
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <FilterPanel onReset={resetFilters} showActions={false}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Период группировки"
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value as PeriodType)}
              options={periodOptions}
            />

            <DatePicker
              label="Дата от"
              value={startDate}
              onChange={setStartDate}
            />

            <DatePicker
              label="Дата до"
              value={endDate}
              onChange={setEndDate}
            />
          </div>

          {(startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="mt-3"
            >
              Сбросить даты
            </Button>
          )}
        </FilterPanel>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 md:overflow-visible md:mx-0 md:px-0">
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 min-w-max md:min-w-0">
          <div className="w-72 md:w-auto flex-shrink-0">
            <StatCard
              title="Общая выручка"
              value={formatCurrency(totalRevenue)}
              icon={<DollarSign className="h-6 w-6" />}
              trend={totalRevenue > totalExpenses ? 'up' : 'down'}
              color="green"
            />
          </div>

          <div className="w-72 md:w-auto flex-shrink-0">
            <StatCard
              title="Общие расходы"
              value={formatCurrency(totalExpenses)}
              icon={<TrendingDown className="h-6 w-6" />}
              trend="neutral"
              color="red"
            />
          </div>

          <div className="w-72 md:w-auto flex-shrink-0">
            <StatCard
              title="Чистая прибыль"
              value={formatCurrency(totalProfit)}
              icon={<TrendingUp className="h-6 w-6" />}
              trend={totalProfit > 0 ? 'up' : 'down'}
              color={totalProfit > 0 ? 'green' : 'red'}
            />
          </div>

          <div className="w-72 md:w-auto flex-shrink-0">
            <StatCard
              title="Всего заказов"
              value={totalOrders.toString()}
              icon={<ShoppingCart className="h-6 w-6" />}
              trend="neutral"
              color="blue"
            />
          </div>
        </div>
      </div>

      {profitData.length > 0 && (
        <>
          <div className="overflow-x-auto -mx-4 px-4 lg:overflow-visible lg:mx-0 lg:px-0">
            <div className="min-w-[600px] lg:min-w-0">
              <ChartCard title="Прибыль по периодам">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={profitData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis
                      dataKey="period"
                      className="text-xs text-gray-600 dark:text-gray-400"
                    />
                    <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#22c55e"
                      strokeWidth={2}
                      name="Выручка"
                      dot={{ fill: '#22c55e' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Расходы"
                      dot={{ fill: '#ef4444' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Прибыль"
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 px-4 lg:overflow-visible lg:mx-0 lg:px-0">
            <div className="flex lg:grid lg:grid-cols-2 gap-6 min-w-max lg:min-w-0">
              <div className="w-[600px] lg:w-auto flex-shrink-0">
                <ChartCard title="Продажи по периодам">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis
                        dataKey="period"
                        className="text-xs text-gray-600 dark:text-gray-400"
                      />
                      <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                      <Bar dataKey="sales" fill="#f97316" name="Продажи" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              <div className="w-[600px] lg:w-auto flex-shrink-0">
                <ChartCard title="Расходы по периодам">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={expensesData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis
                        dataKey="period"
                        className="text-xs text-gray-600 dark:text-gray-400"
                      />
                      <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                      <Bar dataKey="materials" stackId="a" fill="#ef4444" name="Материалы" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="inventory" stackId="a" fill="#f97316" name="Инвентарь" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </div>
          </div>

          {materialExpenses.length > 0 && (
            <div className="overflow-x-auto -mx-4 px-4 lg:overflow-visible lg:mx-0 lg:px-0">
              <div className="min-w-[600px] lg:min-w-0">
                <ChartCard title="Расходы на материалы по видам">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={materialExpenses.slice(0, 10)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.material_name}: ${formatCurrency(entry.total_spent)}`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="total_spent"
                      >
                        {materialExpenses.slice(0, 10).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {materialExpenses.length > 10 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                      Показаны топ-10 материалов по расходам
                    </p>
                  )}
                </ChartCard>
              </div>
            </div>
          )}
        </>
      )}

      {profitData.length === 0 && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
          <LayoutDashboard className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Нет данных для отображения
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Создайте заказы и добавьте материалы для просмотра статистики
          </p>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
  color: 'green' | 'red' | 'blue';
}

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  const colorClasses = {
    green: 'from-green-400 to-emerald-500 dark:from-green-600 dark:to-emerald-700',
    red: 'from-red-400 to-rose-500 dark:from-red-600 dark:to-rose-700',
    blue: 'from-blue-400 to-cyan-500 dark:from-blue-600 dark:to-cyan-700',
  };

  const trendIcon = {
    up: <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />,
    down: <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />,
    neutral: null,
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center text-white`}>
          {icon}
        </div>
        {trendIcon[trend]}
      </div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{title}</h3>
      {children}
    </div>
  );
}
