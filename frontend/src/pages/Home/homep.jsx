import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Nav/Nav.jsx";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Package, Users, ShoppingCart, TrendingUp, DollarSign } from "lucide-react";
import Swal from "sweetalert2";
import "./home.css";

const API_PRODUCTS = "https://bluefruitnutrition-production.up.railway.app/api/products";
const API_CUSTOMERS = "https://bluefruitnutrition-production.up.railway.app/api/customers";
const API_DISTRIBUTORS = "https://bluefruitnutrition-production.up.railway.app/api/distributors";
const API_ORDERS_IN_PROCESS = "https://bluefruitnutrition-production.up.railway.app/api/ordenes/enProceso/total";

const COLORS = ["#0C133F", "#1a265f", "#394a85", "#5260a3", "#6878bf"];

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [ordersInProcess, setOrdersInProcess] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [resProducts, resCustomers, resDistributors, resOrders] = await Promise.all([
          fetch(API_PRODUCTS),
          fetch(API_CUSTOMERS),
          fetch(API_DISTRIBUTORS),
          fetch(API_ORDERS_IN_PROCESS),
        ]);

        if (!resProducts.ok || !resCustomers.ok || !resDistributors.ok || !resOrders.ok) {
          throw new Error("Error al obtener datos");
        }

        const productsData = await resProducts.json();
        const customersData = await resCustomers.json();
        const distributorsData = await resDistributors.json();
        const ordersData = await resOrders.json();

        setProducts(productsData.map(p => ({ ...p, id: p.id ?? p._id })));
        setClients([
          ...customersData.map(c => ({ ...c, role: "Cliente" })),
          ...distributorsData.map(d => ({ ...d, role: "Distribuidor" })),
        ]);
        setOrdersInProcess(ordersData.totalEnProceso ?? 0);
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: error.message,
          icon: 'error',
          confirmButtonColor: '#0C133F'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calcular estadísticas adicionales
  const totalRevenue = products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
  const averageProductPrice = products.length > 0 ? (totalRevenue / products.length).toFixed(2) : 0;

  const statsCards = [
    { 
      title: "Total Productos", 
      value: products.length, 
      icon: Package,
      color: "#0C133F",
      trend: "+12%"
    },
    { 
      title: "Usuarios Registrados", 
      value: clients.length,
      icon: Users,
      color: "#1a265f",
      trend: "+8%"
    },
    { 
      title: "Órdenes en Proceso", 
      value: ordersInProcess,
      icon: ShoppingCart,
      color: "#394a85",
      trend: "+5%"
    },
  ];

  const secondaryStats = [
    {
      title: "Precio Promedio",
      value: `${averageProductPrice}`,
      icon: DollarSign,
      color: "#5260a3"
    },
    {
      title: "Tasa de Crecimiento",
      value: "15.3%",
      icon: TrendingUp,
      color: "#28a745"
    }
  ];

  const roleData = [
    { name: "Clientes", value: clients.filter(c => c.role === "Cliente").length },
    { name: "Distribuidores", value: clients.filter(c => c.role === "Distribuidor").length },
  ];

  // Datos para gráfica de productos más caros
  const topProducts = [...products]
    .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
    .slice(0, 5)
    .map(p => ({ name: p.name.substring(0, 15), price: parseFloat(p.price) }));

  if (loading) {
    return (
      <div className="admin-panel">
        <Sidebar />
        <main className="admin-main-content">
          <div className="loading-container">Cargando datos...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <Sidebar />
      <main className="admin-main-content">
        <div className="admin-welcome-banner">
          <h1>Panel de Administración</h1>
          <p>Visualiza y gestiona todas las métricas clave de tu plataforma</p>
        </div>

        {/* Cards principales en una fila */}
        <div className="admin-stats-grid-main">
          {statsCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="admin-stat-card-modern">
                <div className="stat-card-header">
                  <div className="stat-icon" style={{ backgroundColor: card.color }}>
                    <Icon size={24} color="#fff" />
                  </div>
                  <span className="stat-trend">{card.trend}</span>
                </div>
                <h2>{card.value}</h2>
                <span>{card.title}</span>
              </div>
            );
          })}
        </div>

        {/* Cards secundarias */}
        <div className="admin-stats-grid-secondary">
          {secondaryStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="admin-stat-card-small">
                <div className="stat-icon-small" style={{ backgroundColor: stat.color }}>
                  <Icon size={20} color="#fff" />
                </div>
                <div className="stat-content">
                  <h3>{stat.value}</h3>
                  <span>{stat.title}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gráficas principales */}
        <div className="admin-charts-row">
          {/* Distribución de usuarios */}
          <div className="admin-card">
            <h3>Distribución de Usuarios</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  fill="#0C133F"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ddd" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top 5 productos más caros */}
          <div className="admin-card">
            <h3>Top 5 Productos (Precio)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px" }} />
                <Bar dataKey="price" fill="#0C133F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tablas */}
        <div className="admin-tables-row">
          {/* Productos */}
          <div className="admin-card admin-table-container">
            <h3>Productos Recientes</h3>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 5).map((p, i) => (
                    <tr key={i}>
                      <td>{p.name}</td>
                      <td>${p.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Usuarios recientes */}
          <div className="admin-card admin-table-container">
            <h3>Usuarios Recientes</h3>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.slice(0, 5).map((c, i) => (
                    <tr key={i}>
                      <td>{c.name}</td>
                      <td>{c.email}</td>
                      <td>
                        <span className={`role-badge ${c.role === 'Cliente' ? 'client' : 'distributor'}`}>
                          {c.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;