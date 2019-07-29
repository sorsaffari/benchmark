/**
 * /routes/auth
 */

import express from 'express';
import { AuthController } from '../controllers/auth';

export const getAuthRoutes = () => {
    const controller = AuthController();
    const router = express.Router();

    // NOTE: as a temporary solution:
    //       we fetch and update graknlabsMembers
    //       in regular intervals in order to
    //       verify the users against a recent
    //       list of graknlabs github members.
    controller.updateGraknlabsMembers();

    router.post('/callback', controller.callback);

    router.post('/verify', controller.checkVerification, controller.verify);

    return router;
};
