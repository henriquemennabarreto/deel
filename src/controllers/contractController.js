const { sequelize } = require('../models/model');

exports.getById = async (req, res) => {
  const { Contract } = req.app.get('models');
  const { id } = req.params;

  const contract = await Contract.findOne({ where: { id } });

  if (!contract) return res.status(404).end();
  if (req.profile.id != contract.ContractorId && req.profile.id != contract.ClientId) return res.status(401).end();

  res.json(contract);
}

exports.getAll = async (req, res) => {
  const { Contract } = req.app.get('models');

  const [contracts] = await sequelize.query(`
    select * from Contracts
    where status != 'terminated'
    and ClientId = ${req.profile.id} or ContractorId = ${req.profile.id}
  `);

  if (!contracts || !contracts.length) return res.status(404).end();

  res.json(contracts);
}