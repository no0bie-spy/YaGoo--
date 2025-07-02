import express from 'express';
import bidController from '../controllers/bids';
import getUserfromAuthToken from '../../../middleware/jwtfromUser';

const bidRouter = express.Router();

bidRouter.post('/submit-bids', getUserfromAuthToken, bidController.submitBid);

export default bidRouter;
