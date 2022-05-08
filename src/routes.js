const router = require('express').Router();
const { getProfile } = require('./middleware/auth');

const contractController = require('./controllers/contractController');
const jobController = require('./controllers/jobController');
const profileController = require('./controllers/profileController');
const statementController = require('./controllers/statementController');

/**
 * @returns contract by id
 */
router.get('/contracts/:id', getProfile, contractController.getById);

/**
 * @returns contracts
 */
router.get('/contracts/', getProfile, contractController.getAll);

/**
 * @returns unpaid jobs
 */
router.get('/jobs/unpaid/', getProfile, jobController.getUnpaid);

/**
 * @returns pay a job
 */
router.post('/jobs/:id/pay', getProfile, jobController.pay);

/**
 * @returns deposits money into the the the balance of a client
 */
router.post('/balances/deposit/:userId', getProfile, profileController.deposit);

/**
 * @returns Returns the profession that earned the most money
 */
router.get('/admin/best-profession', statementController.contractorMostMoney);

/**
 * @returns Returns the clients the paid the most for jobs
 */
router.get('/admin/best-clients', statementController.clientBestPayer);

module.exports = router;