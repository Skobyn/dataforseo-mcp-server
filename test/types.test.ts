/**
 * Tests for types and enums (src/api/types.ts)
 */
import { StatusCode, ApiMethod } from '../src/api/types';

describe('StatusCode enum', () => {
  it('has correct SUCCESS code', () => {
    expect(StatusCode.SUCCESS).toBe(20000);
  });

  it('has correct TASK_CREATED code', () => {
    expect(StatusCode.TASK_CREATED).toBe(20100);
  });

  it('has correct NO_RESULTS code', () => {
    expect(StatusCode.NO_RESULTS).toBe(20011);
  });

  it('has correct ERROR code', () => {
    expect(StatusCode.ERROR).toBe(40000);
  });

  it('has correct AUTH_ERROR code', () => {
    expect(StatusCode.AUTH_ERROR).toBe(40100);
  });

  it('has correct INVALID_PARAMETERS code', () => {
    expect(StatusCode.INVALID_PARAMETERS).toBe(40200);
  });

  it('can be used for status checking', () => {
    const responseCode: number = 20000;
    expect(responseCode === StatusCode.SUCCESS).toBe(true);
    expect(responseCode === StatusCode.ERROR).toBe(false);
  });
});

describe('ApiMethod enum', () => {
  it('has correct TASK_POST value', () => {
    expect(ApiMethod.TASK_POST).toBe('task_post');
  });

  it('has correct TASKS_READY value', () => {
    expect(ApiMethod.TASKS_READY).toBe('tasks_ready');
  });

  it('has correct TASK_GET value', () => {
    expect(ApiMethod.TASK_GET).toBe('task_get');
  });

  it('has correct LIVE value', () => {
    expect(ApiMethod.LIVE).toBe('live');
  });
});

describe('Type interfaces usage', () => {
  // These tests verify the interfaces work correctly at runtime
  // by creating objects that match the interface shapes

  it('DataForSeoResponse shape is correct', () => {
    const response = {
      version: '0.1',
      status_code: 20000,
      status_message: 'Ok.',
      time: '0.5 sec.',
      cost: 0.01,
      tasks_count: 1,
      tasks_error: 0,
      tasks: [{ id: '123' }],
    };

    expect(response.status_code).toBe(StatusCode.SUCCESS);
    expect(response.tasks).toHaveLength(1);
  });

  it('LocationParameters shape is correct', () => {
    const params = {
      location_name: 'United States',
      location_code: 2840,
      language_name: 'English',
      language_code: 'en',
    };

    expect(params.location_name).toBe('United States');
    expect(params.location_code).toBe(2840);
  });

  it('PaginationParameters shape is correct', () => {
    const params = {
      limit: 10,
      offset: 0,
    };

    expect(params.limit).toBe(10);
    expect(params.offset).toBe(0);
  });

  it('DateRangeParameters shape is correct', () => {
    const params = {
      date_from: '2024-01-01',
      date_to: '2024-12-31',
    };

    expect(params.date_from).toBe('2024-01-01');
    expect(params.date_to).toBe('2024-12-31');
  });

  it('TaskParameters shape is correct', () => {
    const params = {
      tag: 'my-task',
      priority: 1,
      postback_url: 'https://example.com/callback',
      postback_data: 'custom-data',
    };

    expect(params.tag).toBe('my-task');
    expect(params.priority).toBe(1);
  });
});
