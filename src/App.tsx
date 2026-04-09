import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import OfflineIndicator from './components/OfflineIndicator';
import NotificationManager from './components/NotificationManager';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Shop from './pages/Shop';
import Materials from './pages/Materials';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import Clients from './pages/Clients';
import Orders from './pages/Orders';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import Planner from './pages/Planner';
import Purchases from './pages/Purchases';
import Employees from './pages/Employees';
import EmployeeRegister from './pages/EmployeeRegister';
import NoAccess from './pages/NoAccess';
import About from './pages/About';
import Recipes from './pages/Recipes';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';


function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <OfflineIndicator />
          <NotificationManager />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/employee-register/:inviteToken" element={<EmployeeRegister />} />
            <Route path="/no-access" element={<NoAccess />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/materials" element={<Materials />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/products" element={<Products />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/planner" element={<Planner />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/about" element={<About />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
