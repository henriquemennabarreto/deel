const { sequelize } = require('../models/model');

const getTotalToReceive = async () => {
  const [[value]] = await sequelize.query(`
    select sum(j.price) as total from Jobs j
    left join Contracts c on j.ContractId = c.id
    left join Profiles p on c.ClientId = p.id
    where p.id = 1 
    and c.status = 'in_progress'
    and j.paid is null;
  `);

  if (!value) return 0;

  return value.total;
}

exports.deposit = async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;

  if (amount == undefined || typeof amount != 'number' || amount == 0) return res.status(400).json({ message: "Wrong amount value" }).end();

  const { Profile } = req.app.get('models');
  const profile = await Profile.findOne({ where: { id: userId, type: "client" } });

  if (!profile) return res.status(404).end();

  const total_receive = await getTotalToReceive();

  if (profile.balance + amount > (total_receive + total_receive * (25 / 100))) return res.status(400).json({ message: "A client can't deposit more than 25% his total of jobs to pay" }).end();

  const new_balance = profile.balance + amount;

  Profile.update({ balance: new_balance }, {
    where: { id: profile.id }
  }).then(() => {
    res.json({ deposit: 'successful' });
  }).catch(err => {
    console.error(err.message);
    res.json({ deposit: 'failed' });
  })
}