/**
 * Property Controller - CRUD operations
 */
const Property = require('../models/Property');
const logger = require('../config/logger');

const getProperties = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.district) filter.district_name = req.query.district;
    if (req.query.minPrice) filter.predicted_price = { $gte: parseFloat(req.query.minPrice) };
    if (req.query.maxPrice) filter.predicted_price = { ...filter.predicted_price, $lte: parseFloat(req.query.maxPrice) };

    const properties = await Property.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Property.countDocuments(filter);

    res.status(200).json({ success: true, count: properties.length, total, page, pages: Math.ceil(total / limit), data: properties });
  } catch (error) {
    next(error);
  }
};

const getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.status(200).json({ success: true, data: property });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    next(error);
  }
};

const createProperty = async (req, res, next) => {
  try {
    const propertyData = { ...req.body, userId: req.user ? req.user._id : null };
    const property = await Property.create(propertyData);
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

const updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    // Check ownership (admin can update any, user only their own)
    if (req.user.role !== 'admin' && property.userId && property.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this property' });
    }
    property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    // Check ownership (admin can delete any, user only their own)
    if (req.user.role !== 'admin' && property.userId && property.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
    }
    await property.deleteOne();
    res.status(200).json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getPropertyStats = async (req, res, next) => {
  try {
    const stats = await Property.aggregate([
      { $match: { predicted_price: { $ne: null } } },
      { $group: {
          _id: '$district_name',
          avgPrice: { $avg: '$predicted_price' },
          minPrice: { $min: '$predicted_price' },
          maxPrice: { $max: '$predicted_price' },
          count: { $sum: 1 },
        }
      },
      { $sort: { avgPrice: -1 } },
    ]);
    res.status(200).json({ success: true, data: { byDistrict: stats } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProperties, getProperty, createProperty, updateProperty, deleteProperty, getPropertyStats };
