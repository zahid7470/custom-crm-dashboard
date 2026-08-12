import { Router } from 'express';
import { getProjects, createProject, updateProject } from '../controllers/projectController.js';

const router = Router();

router.get('/', getProjects);
router.post('/', createProject);
router.patch('/:id', updateProject);

export default router;
