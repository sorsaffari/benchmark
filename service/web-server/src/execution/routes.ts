/**
 * /routes/execution
 */

import express from 'express';
import { Client as IEsClient } from '@elastic/elasticsearch';
import { getExecutionController, IExecutionController } from './controller';
import { isPRMerged } from './middlewares';

export const getExecutionRoutes = (esClient: IEsClient) => {
    const controller: IExecutionController = getExecutionController(esClient);
    const router = express.Router();

    router.post('/pull_request', isPRMerged, controller.create.bind(controller));

    router.post('/new', controller.create.bind(controller));

    router.post('/delete', controller.destroy.bind(controller));

    router.post('/start', (req, res) => { controller.updateStatus.bind(controller)(req, res, 'RUNNING'); });

    router.post('/completed', (req, res) => { controller.updateStatus.bind(controller)(req, res, 'COMPLETED'); });

    router.post('/stop', (req, res) => { controller.updateStatus.bind(controller)(req, res, 'CANCELED'); });

    router.post('/failed', (req, res) => { controller.updateStatus.bind(controller)(req, res, 'FAILED'); });

    router.post('/query', controller.getGraphqlServer.bind(controller)());

    return router;
};
