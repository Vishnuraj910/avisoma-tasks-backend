import request from 'supertest';
import app from '../app';
import { query } from '../utils/db';
import { TaskStatusEnum, ZodErrorEnum } from '../models/enums';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';

jest.mock('../utils/db', () => ({
  query: jest.fn(),
  pool: {
    query: jest.fn(),
  },
}));

describe('Tasks API Routes', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatusEnum.PENDING,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with title and description', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: [mockTask],
      });

      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          description: 'Test Description',
        });

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toHaveProperty('status', true);
      expect(response.body.data).toMatchObject({
        id: mockTask.id,
        title: mockTask.title,
        description: mockTask.description,
        status: mockTask.status,
      });
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tasks'),
        ['Test Task', 'Test Description']
      );
    });

    it('should create a new task with only title', async () => {
      const taskWithoutDescription = { ...mockTask, description: null };
      (query as jest.Mock).mockResolvedValue({
        rows: [taskWithoutDescription],
      });

      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
        });

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toHaveProperty('status', true);
      expect(response.body.data.description).toBeNull();
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tasks'),
        ['Test Task', null]
      );
    });

    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          description: 'Test Description',
        });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('error', ZodErrorEnum.VALIDATION_ERROR);
      expect(response.body).toHaveProperty('details');
      expect(query).not.toHaveBeenCalled();
    });

    it('should return 400 when title is empty string', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: '',
        });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('error', ZodErrorEnum.VALIDATION_ERROR);
      expect(query).not.toHaveBeenCalled();
    });

    it('should return 400 when body is empty', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({});

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('error', ZodErrorEnum.VALIDATION_ERROR);
      expect(query).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      (query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
        });

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/tasks', () => {
    it('should return all non-deleted tasks', async () => {
      const mockTasks = [
        mockTask,
        { ...mockTask, id: '2', title: 'Task 2' },
      ];
      (query as jest.Mock).mockResolvedValue({
        rows: mockTasks,
      });

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data).toEqual(mockTasks);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, title, description, status, created_at, updated_at')
      );
    });

    it('should return empty array when no tasks exist', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toEqual([]);
    });

    it('should handle database errors', async () => {
      (query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a single task by id', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: [mockTask],
      });

      const response = await request(app).get('/api/tasks/1');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toEqual(mockTask);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, title, description, status, created_at, updated_at'),
        [1]
      );
    });

    it('should return 404 when task does not exist', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const response = await request(app).get('/api/tasks/999');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', ZodErrorEnum.TASK_NOT_FOUND);
    });

    it('should return 400 when id is not a valid integer', async () => {
      const response = await request(app).get('/api/tasks/abc');

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('error', 'Invalid id');
      expect(query).not.toHaveBeenCalled();
    });

    it('should return 400 when id is zero', async () => {
      const response = await request(app).get('/api/tasks/0');

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('error', 'Invalid id');
      expect(query).not.toHaveBeenCalled();
    });

    it('should return 400 when id is negative', async () => {
      const response = await request(app).get('/api/tasks/-1');

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('error', 'Invalid id');
      expect(query).not.toHaveBeenCalled();
    });

    it('should return 400 when id is a float', async () => {
      const response = await request(app).get('/api/tasks/1.5');

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('error', 'Invalid id');
      expect(query).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      (query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/tasks/1');

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update task status to in-progress', async () => {
      const updatedTask = { ...mockTask, status: TaskStatusEnum.IN_PROGRESS };
      (query as jest.Mock).mockResolvedValue({
        rows: [updatedTask],
      });

      const response = await request(app)
        .patch('/api/tasks/1')
        .send({
          status: TaskStatusEnum.IN_PROGRESS,
        });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.status).toBe(TaskStatusEnum.IN_PROGRESS);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE tasks'),
        [TaskStatusEnum.IN_PROGRESS, 1]
      );
    });

    it('should update task status to completed', async () => {
      const updatedTask = { ...mockTask, status: TaskStatusEnum.COMPLETED };
      (query as jest.Mock).mockResolvedValue({
        rows: [updatedTask],
      });

      const response = await request(app)
        .patch('/api/tasks/1')
        .send({
          status: TaskStatusEnum.COMPLETED,
        });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.status).toBe(TaskStatusEnum.COMPLETED);
    });

    it('should update task status to pending', async () => {
      const updatedTask = { ...mockTask, status: TaskStatusEnum.PENDING };
      (query as jest.Mock).mockResolvedValue({
        rows: [updatedTask],
      });

      const response = await request(app)
        .patch('/api/tasks/1')
        .send({
          status: TaskStatusEnum.PENDING,
        });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.status).toBe(TaskStatusEnum.PENDING);
    });

    it('should return 404 when task does not exist', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const response = await request(app)
        .patch('/api/tasks/999')
        .send({
          status: TaskStatusEnum.IN_PROGRESS,
        });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', ZodErrorEnum.TASK_NOT_FOUND);
    });

    it('should return 400 when id is not a valid integer', async () => {
      const response = await request(app)
        .patch('/api/tasks/abc')
        .send({
          status: TaskStatusEnum.IN_PROGRESS,
        });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('error', 'Invalid id');
      expect(query).not.toHaveBeenCalled();
    });

    it('should return 400 when status is missing', async () => {
      const response = await request(app)
        .patch('/api/tasks/1')
        .send({});

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', ZodErrorEnum.VALIDATION_ERROR);
      expect(response.body).toHaveProperty('details');
      expect(query).not.toHaveBeenCalled();
    });

    it('should return 400 when status is invalid', async () => {
      const response = await request(app)
        .patch('/api/tasks/1')
        .send({
          status: 'invalid-status',
        });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', ZodErrorEnum.VALIDATION_ERROR);
      expect(response.body).toHaveProperty('details');
      expect(query).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      (query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .patch('/api/tasks/1')
        .send({
          status: TaskStatusEnum.IN_PROGRESS,
        });

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should soft delete a task', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: [mockTask],
      });

      const response = await request(app).delete('/api/tasks/1');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toEqual(mockTask);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE tasks'),
        [1]
      );
    });

    it('should return 404 when task does not exist', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const response = await request(app).delete('/api/tasks/999');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', ZodErrorEnum.TASK_NOT_FOUND);
    });

    it('should return 400 when id is not a valid integer', async () => {
      const response = await request(app).delete('/api/tasks/abc');

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('error', 'Invalid id');
      expect(query).not.toHaveBeenCalled();
    });

    it('should return 400 when id is zero', async () => {
      const response = await request(app).delete('/api/tasks/0');

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('error', 'Invalid id');
      expect(query).not.toHaveBeenCalled();
    });

    it('should return 400 when id is negative', async () => {
      const response = await request(app).delete('/api/tasks/-1');

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('error', 'Invalid id');
      expect(query).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      (query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete('/api/tasks/1');

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/nonexistent');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('error', 'Not found');
    });
  });
});

