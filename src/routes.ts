import { Router } from 'express';
import { fetchPrices, addUser } from './controllers';

const router = Router();

router.get('/prices', fetchPrices);
router.post('/users', addUser);

export = router;
