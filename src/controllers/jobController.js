const { sequelize } = require('../models/model')

exports.getUnpaid = async (req, res) => {
  const [unpaids] = await sequelize.query(`
    select j.id, j.description, j.price, j.paid, j.paymentDate, j.createdAt, j.updatedAt, j.ContractId from Jobs j
    left join Contracts c on j.ContractId = c.id
    where c.status = 'in_progress' 
    and j.paid is null
    and ContractId = ${req.profile.id};
  `);

  if (!unpaids || !unpaids.length) return res.status(404).end();

  res.json(unpaids);
}

exports.pay = async (req, res) => {
  const { id } = req.params;
  const client_id = req.profile.id;

  const [job] = await sequelize.query(`
    select j.id, j.description, j.price, j.paid, j.paymentDate, j.createdAt, j.updatedAt, j.ContractId, c.ContractorId
    from Jobs j
    left join Contracts c on j.ContractId = c.id
    where c.status = 'in_progress' and j.paid is null 
    and c.ClientId = ${client_id}
    and j.id = ${id}
  `);

  if (!job || !job.length) return res.status(404).end();

  const { Contract, Job, Profile } = req.app.get('models');
  const client = await Profile.findOne({ where: { id: client_id } });

  if (client.balance > job[0].price) {
    const contract = await Contract.findOne({ where: { id: job[0].ContractId } });
    const contractor = await Profile.findOne({ where: { id: contract.ContractorId } });

    const new_balance_contractor = contractor.balance + job[0].price;
    const new_balance_client = client.balance - job[0].price;

    const t = await sequelize.transaction();

    try {
      await Profile.update({ balance: new_balance_client }, {
        where: { id: contract.ClientId }
      }, { transaction: t }).catch(err => { throw err; });
      await Profile.update({ balance: new_balance_contractor }, {
        where: { id: contract.ContractorId }
      }, { transaction: t }).catch(err => { throw err; });
      await Job.update({ paid: 1, paymentDate: new Date() }, {
        where: { id: job[0].id }
      }, { transaction: t }).catch(err => { throw err; });

      await t.commit();

      res.json({ payment: 'successful' });

    } catch (err) {
      await t.rollback();
      console.error(err);
      res.json({ payment: 'failed' });
    }

  } else {
    res.json({ payment: 'denied', message: 'insufficient funds' });
  }
}