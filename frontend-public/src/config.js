const config = {
  // URL del backend - cambiar según el entorno
  API_URL: import.meta.env.VITE_API_URL ||
           'https://bluefruitnutrition-production.up.railway.app/api',
 
  // Otras configuraciones
  APP_NAME: 'Blue Fruit Nutrition',
  VERSION: '1.0.0',
};


export default config;