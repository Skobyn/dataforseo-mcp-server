/**
 * Tests for DataForSeoClient (src/api/client.ts)
 */
import axios from 'axios';
import { setupApiClient } from '../src/api/client';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DataForSeoClient', () => {
  const mockHttpClient = {
    get: jest.fn(),
    post: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockHttpClient as any);
    mockedAxios.isAxiosError.mockReturnValue(false);
  });

  describe('setupApiClient', () => {
    it('creates client with correct credentials', () => {
      const client = setupApiClient('testuser', 'testpass');

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.dataforseo.com/v3',
        auth: {
          username: 'testuser',
          password: 'testpass',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(client.login).toBe('testuser');
      expect(client.password).toBe('testpass');
      expect(client.baseUrl).toBe('https://api.dataforseo.com/v3');
    });

    it('returns client with get and post methods', () => {
      const client = setupApiClient('user', 'pass');

      expect(typeof client.get).toBe('function');
      expect(typeof client.post).toBe('function');
    });
  });

  describe('client.get', () => {
    it('returns data on successful GET request', async () => {
      const mockResponse = { data: { result: 'success' } };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const client = setupApiClient('user', 'pass');
      const result = await client.get('/test/endpoint');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/test/endpoint');
      expect(result).toEqual({ result: 'success' });
    });

    it('throws and logs error on failed GET request', async () => {
      const mockError = new Error('Network error');
      mockHttpClient.get.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const client = setupApiClient('user', 'pass');

      await expect(client.get('/test/endpoint')).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('logs axios error details when available', async () => {
      const axiosError = {
        response: { data: { error: 'API error message' } },
        message: 'Request failed',
      };
      mockHttpClient.get.mockRejectedValue(axiosError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const client = setupApiClient('user', 'pass');

      await expect(client.get('/test/endpoint')).rejects.toEqual(axiosError);
      expect(consoleSpy).toHaveBeenCalledWith(
        'DataForSEO API GET error (/test/endpoint):',
        { error: 'API error message' }
      );

      consoleSpy.mockRestore();
    });
  });

  describe('client.post', () => {
    it('returns data on successful POST request', async () => {
      const mockResponse = { data: { id: '123', status: 'created' } };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const client = setupApiClient('user', 'pass');
      const postData = { keyword: 'test' };
      const result = await client.post('/test/endpoint', postData);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/test/endpoint', postData);
      expect(result).toEqual({ id: '123', status: 'created' });
    });

    it('throws and logs error on failed POST request', async () => {
      const mockError = new Error('Network error');
      mockHttpClient.post.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const client = setupApiClient('user', 'pass');

      await expect(client.post('/test/endpoint', {})).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('logs axios error details when available', async () => {
      const axiosError = {
        response: { data: { error: 'Invalid parameters' } },
        message: 'Request failed',
      };
      mockHttpClient.post.mockRejectedValue(axiosError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const client = setupApiClient('user', 'pass');

      await expect(client.post('/test/endpoint', {})).rejects.toEqual(axiosError);
      expect(consoleSpy).toHaveBeenCalledWith(
        'DataForSEO API POST error (/test/endpoint):',
        { error: 'Invalid parameters' }
      );

      consoleSpy.mockRestore();
    });

    it('logs error message when response data is not available', async () => {
      const axiosError = {
        message: 'Connection timeout',
      };
      mockHttpClient.post.mockRejectedValue(axiosError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const client = setupApiClient('user', 'pass');

      await expect(client.post('/test/endpoint', {})).rejects.toEqual(axiosError);
      expect(consoleSpy).toHaveBeenCalledWith(
        'DataForSEO API POST error (/test/endpoint):',
        'Connection timeout'
      );

      consoleSpy.mockRestore();
    });
  });
});
