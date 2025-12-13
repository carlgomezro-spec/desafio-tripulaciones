const Mkt = require('../models/mktModel.js');

module.exports = {

  getSales: async (req, res) => {
    try {
      const sales = await Mkt.getSales(); 
      res.json(sales);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getCustomers: async (req, res) => {
    try {
      const customers = await Mkt.getCustomers(); 
      res.json(customers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getProducts: async (req, res) => {
    try {
      const products = await Mkt.getProducts(); 
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};