const Business = require('../models/Business');

/**
 * Get current business profile
 */
const getBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    return res.json({ success: true, business });
  } catch (error) {
    next(error);
  }
};

/**
 * Update business settings (Owner only)
 */
const updateBusiness = async (req, res, next) => {
  try {
    const {
      name,
      category,
      logo,
      address,
      contactNumber,
      currency,
      currencySymbol,
      taxRate,
      taxInclusive,
      receiptHeader,
      receiptFooter,
      timezone,
      onboardingCompleted,
    } = req.body;

    const business = await Business.findById(req.businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    if (name !== undefined) business.name = name;
    if (category !== undefined) business.category = category;
    if (logo !== undefined) business.logo = logo;
    if (address !== undefined) business.address = address;
    if (contactNumber !== undefined) business.contactNumber = contactNumber;
    if (currency !== undefined) business.currency = currency;
    if (currencySymbol !== undefined) business.currencySymbol = currencySymbol;
    if (taxRate !== undefined) business.taxRate = Number(taxRate);
    if (taxInclusive !== undefined) business.taxInclusive = Boolean(taxInclusive);
    if (receiptHeader !== undefined) business.receiptHeader = receiptHeader;
    if (receiptFooter !== undefined) business.receiptFooter = receiptFooter;
    if (timezone !== undefined) business.timezone = timezone;
    if (onboardingCompleted !== undefined) business.onboardingCompleted = Boolean(onboardingCompleted);

    await business.save();

    return res.json({
      success: true,
      message: 'Business settings updated successfully.',
      business,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBusiness,
  updateBusiness,
};
