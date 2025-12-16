import { useEffect, useState } from "react";
import { getProductsPaginated } from "../../../../services/mktServices";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList
} from "recharts";
import Pagination from "../../../Pagination/Pagination";

const LIMIT = 10;

const CATEGORY_COLORS = {
  'ropa': '#FF6B6B',        
  'deportes': '#4ECDC4',     
  'juguetes': '#FFD166',     
  'hogar': '#06D6A0',        
  'electrónica': '#118AB2',  
  'Sin categoría': '#A0A0A0' 
};

const CATEGORY_ALIASES = {
  'ropa deportiva': 'ropa',
  'ropa casual': 'ropa',
  'ropa formal': 'ropa',
  'deporte': 'deportes',
  'deportivos': 'deportes',
  'juguete': 'juguetes',
  'hogar y jardín': 'hogar',
  'electrónica y tecnología': 'electrónica',
  'electrónica y electricidad': 'electrónica',
  'electrónicos': 'electrónica',
  'electronicos': 'electrónica'
};

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [chartData, setChartData] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    getProductsPaginated(page, LIMIT)
      .then(res => {
        setProducts(res.data);
        setPagination(res.pagination);
        
        const normalizedData = res.data.map(product => {
          let category = (product.category || 'Sin categoría').toLowerCase().trim();
          
          if (CATEGORY_ALIASES[category]) {
            category = CATEGORY_ALIASES[category];
          }
          
          return {
            ...product,
            normalizedCategory: category
          };
        });
        
        const chartData = normalizedData.map(product => ({
          id: product.product_id,
          name: product.product_name.substring(0, 15) + (product.product_name.length > 15 ? '...' : ''),
          precio: parseFloat(product.unit_price) || 0,
          categoria: product.normalizedCategory,
          fullName: product.product_name,
          color: CATEGORY_COLORS[product.normalizedCategory] || CATEGORY_COLORS['Sin categoría']
        }));
        
        const stats = normalizedData.reduce((acc, product) => {
          const category = product.normalizedCategory;
          
          if (!acc[category]) {
            acc[category] = {
              count: 0,
              totalPrice: 0,
              minPrice: Infinity,
              maxPrice: 0,
              products: []
            };
          }
          
          const price = parseFloat(product.unit_price) || 0;
          acc[category].count++;
          acc[category].totalPrice += price;
          acc[category].products.push(product.product_name);
          
          if (price < acc[category].minPrice) acc[category].minPrice = price;
          if (price > acc[category].maxPrice) acc[category].maxPrice = price;
          
          return acc;
        }, {});
        
        setChartData(chartData);
        setCategoryStats(stats);
        setError(null);
      })
      .catch(() => setError("Error cargando productos"))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <p className="mkt-loading">⏳ Cargando análisis de productos...</p>;
  if (error) return <p className="mkt-error">{error}</p>;
  if (!pagination) return null;

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === Infinity) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(price);
  };

  const getCategoryColor = (category) => {
    const normalizedCat = category.toLowerCase().trim();
    return CATEGORY_COLORS[normalizedCat] || CATEGORY_COLORS['Sin categoría'];
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <div className="tooltip-header">
            <div className="tooltip-color-dot" style={{ backgroundColor: data.color, border: `2px solid ${data.color}80` }} />
            <strong className="tooltip-category">
              {data.categoria}
            </strong>
          </div>
          <div className="tooltip-content">
            <p>
              <strong className="tooltip-label">ID:</strong> 
              <span className="tooltip-value">#{data.id}</span>
            </p>
            <p>
              <strong className="tooltip-label">Producto:</strong> 
              <span className="tooltip-value">{data.fullName}</span>
            </p>
            <p className="tooltip-price" style={{ backgroundColor: `${data.color}15`, color: data.color }}>
              <strong>Precio:</strong> {formatPrice(data.precio)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomLegend = () => {
    const categories = Object.keys(CATEGORY_COLORS).filter(cat => cat !== 'Sin categoría');
    
    return (
      <div className="custom-legend">
        {categories.map((category) => {
          const stats = categoryStats[category];
          const color = CATEGORY_COLORS[category];
          const count = stats ? stats.count : 0;
          
          return (
            <div 
              key={category}
              className="legend-item"
              style={{ border: `1px solid ${color}30` }}
            >
              <div className="legend-color-dot" style={{ backgroundColor: color, border: `2px solid ${color}` }} />
              <span className="legend-category">
                {category}
              </span>
              <span className="legend-count" style={{ backgroundColor: `${color}20`, color: color }}>
                {count}
              </span>
            </div>
          );
        })}
        
        {/* Contador total */}
        <div className="legend-total">
          <span>Total: {products.length} productos</span>
        </div>
      </div>
    );
  };

  return (
    <section className="mkt-section">
      <div className="mkt-header">
        <h2>Productos</h2>
        <p className="mkt-subtitle">
          Página {page} de {pagination.totalPages} • Mostrando {products.length} productos
        </p>
      </div>
      
      {/* Gráfico de Barras */}
      <div className="mkt-chart-container">
        <h3 className="chart-title">
          Distribución de precios por producto
        </h3>
        <div className="chart-wrapper">
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                className="chart-xaxis"
              />
              <YAxis 
                tickFormatter={(value) => `${value}€`}
                className="chart-yaxis"
                label={{ 
                  value: 'Precio (€)', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -15,
                  className: "chart-axis-label"
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend className="chart-legend" />
              <Bar 
                dataKey="precio" 
                name="Precio" 
                radius={[6, 6, 0, 0]}
                barSize={35}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke={entry.color}
                    strokeWidth={1}
                    strokeOpacity={0.8}
                    fillOpacity={0.9}
                  />
                ))}
                <LabelList 
                  dataKey="precio" 
                  position="top" 
                  formatter={(value) => `${value}€`}
                  className="chart-label"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Leyenda personalizada */}
        {renderCustomLegend()}
      </div>

      {/* Tabla de Productos con ID */}
      <div className="mkt-table-container">
        <h3 className="table-title">
          Detalle de productos
        </h3>
        <div className="table-responsive">
          <table className="mkt-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio Unitario</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const category = (product.category || 'Sin categoría').toLowerCase().trim();
                const normalizedCat = CATEGORY_ALIASES[category] || category;
                const color = getCategoryColor(normalizedCat);
                
                return (
                  <tr 
                    key={product.product_id} 
                    style={{ borderLeft: `4px solid ${color}` }}
                  >
                    <td className="product-id">
                      #{product.product_id}
                    </td>
                    <td>
                      <div className="product-name-container">
                        <div 
                          className="product-color-dot"
                          style={{ backgroundColor: color, border: `2px solid ${color}80` }}
                        />
                        {product.product_name}
                      </div>
                    </td>
                    <td>
                      <span className="category-badge" style={{ backgroundColor: `${color}20`, color: color }}>
                        {normalizedCat}
                      </span>
                    </td>
                    <td className="product-price">
                      {formatPrice(product.unit_price)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="footer-label">
                  Total de productos en esta página:
                </td>
                <td className="footer-total">
                  {products.length}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Resumen por categoría */}
      <div className="category-stats-container">
        <h4 className="stats-title">
          Estadísticas por categoría
        </h4>
        <div className="stats-grid">
          {Object.entries(CATEGORY_COLORS).map(([category, color]) => {
            if (category === 'Sin categoría' && (!categoryStats[category] || categoryStats[category].count === 0)) {
              return null;
            }
            
            const stats = categoryStats[category] || { count: 0, totalPrice: 0, minPrice: Infinity, maxPrice: 0 };
            const avgPrice = stats.count > 0 ? stats.totalPrice / stats.count : 0;
            
            return (
              <div 
                key={category}
                className="stat-card"
                style={{ borderTop: `4px solid ${color}` }}
              >
                <div className="stat-header">
                  <div className="stat-color-dot" style={{ backgroundColor: color, border: `2px solid ${color}` }} />
                  <strong className="stat-category">
                    {category}
                  </strong>
                </div>
                
                <div className="stat-count-container">
                  <span className="stat-label">Productos:</span>
                  <span className="stat-count" style={{ color: color }}>
                    {stats.count}
                  </span>
                </div>
                
                <div className="stat-details">
                  <div className="stat-row">
                    <span>Precio promedio:</span>
                    <span className="stat-value">{formatPrice(avgPrice)}</span>
                  </div>
                  <div className="stat-row">
                    <span>Mínimo:</span>
                    <span>{formatPrice(stats.minPrice)}</span>
                  </div>
                  <div className="stat-row">
                    <span>Máximo:</span>
                    <span>{formatPrice(stats.maxPrice)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Paginación usando tu componente original */}
      <div className="mkt-pagination">
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      </div>
    </section>
  );
};

export default ProductsList;