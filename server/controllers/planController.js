import Plan from '../models/Plan.js';

export const createPlan = async (req, res) => {
  try {
    const newPlan = new Plan(req.body);
    const savedPlan = await newPlan.save();
    res.status(201).json(savedPlan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create plan', error });
  }
};

export const getPlans = async (req, res) => {
  try {
    console.log("🔍 Requesting all plans...");
    const plans = await Plan.find();
    console.log(`✅ Found ${plans.length} plans`);
    res.status(200).json(plans);
  } catch (error) {
    console.error("❌ Error fetching plans:", error);
    res.status(500).json({ message: 'Failed to fetch plans', error });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plan', error });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const updatedPlan = await Plan.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedPlan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update plan', error });
  }
};

export const deletePlan = async (req, res) => {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete plan', error });
  }
};
