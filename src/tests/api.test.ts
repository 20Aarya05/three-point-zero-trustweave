import request from 'supertest';
import app from '../server';

describe('TrustWeave API', () => {
  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'TrustWeave Backend API');
      expect(response.body).toHaveProperty('version', 'v1');
      expect(response.body).toHaveProperty('status', 'running');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/evaluate/health', () => {
    it('should return evaluation service health', async () => {
      const response = await request(app)
        .get('/api/evaluate/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('version', 'v1');
    });
  });

  describe('POST /api/evaluate/full', () => {
    const validRequest = {
      credit_purpose: 'home_purchase',
      behavioral_inputs: {
        payment_history_score: 85,
        credit_utilization: 0.25
      },
      evidence_metadata: [
        {
          document_type: 'bank_statement',
          verification_status: 'verified'
        }
      ],
      loan_history: 'Previous auto loan paid successfully',
      capacity_inputs: {
        monthly_income: 8500,
        monthly_expenses: 3200,
        debt_to_income_ratio: 0.28
      },
      asset_inputs: {
        savings_balance: 45000,
        checking_balance: 8500
      }
    };

    it('should validate request format', async () => {
      const response = await request(app)
        .post('/api/evaluate/full')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should require JSON content type', async () => {
      const response = await request(app)
        .post('/api/evaluate/full')
        .set('Content-Type', 'text/plain')
        .send('invalid')
        .expect(415);

      expect(response.body).toHaveProperty('error', 'Unsupported Media Type');
    });

    // Note: This test will fail until agents are implemented
    it('should handle agent not implemented error', async () => {
      const response = await request(app)
        .post('/api/evaluate/full')
        .send(validRequest)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Evaluation Failed');
      expect(response.body.message).toContain('not implemented');
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
    });
  });
});