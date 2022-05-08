const { sequelize } = require("../models/model");

const validateDate = (start, end) => {
  if (new Date(start) == 'Invalid Date' || new Date(end) == 'Invalid Date') return false;
}

exports.contractorMostMoney = async (req, res) => {
  if (validateDate(req.query.start, req.query.end) == false) return res.status(400).json({ message: "Invalid start or end date" });

  const start = req.query.start;
  const end = req.query.end;

  const [professionals] = await sequelize.query(`
    SELECT p.id, p.firstName || ' ' || p.lastName AS professional, sum(j.price) as payment
    from Profiles p
    left join Contracts c on p.id = c.ContractorId
    left join Jobs j on c.id = j.ContractId
    where j.paid is not null
    and c.createdAt BETWEEN '${start}' and '${end}'
    group by p.id
    order by 2 desc;
  `);

  if (!professionals || !professionals.length) return res.status(404).end();

  res.json(professionals);
}

exports.clientBestPayer = async (req, res) => {
  if (validateDate(req.query.start, req.query.end) == false) return res.status(400).json({ message: "Invalid start or end date" });

  const start = req.query.start;
  const end = req.query.end;
  const limit = req.query.limit || 2;

  const [clients] = await sequelize.query(`
    SELECT p.id, p.firstName || ' ' || p.lastName AS professional, sum(j.price) as payment
    from Profiles p
    left join Contracts c on p.id = c.ClientId
    left join Jobs j on c.id = j.ContractId
    where j.paid is not null
    and c.createdAt BETWEEN '${start}' and '${end}'
    group by p.id
    order by 2 desc
    limit ${limit};
  `);

  if (!clients || !clients.length) return res.status(404).end();

  res.json(clients);
}