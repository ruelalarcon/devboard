const { mock } = require("jest-mock-extended");

// Mock the Sequelize models
const mockModels = {
  User: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  Channel: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  Message: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  Reply: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  Rating: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn(),
  },
  sequelize: {
    transaction: jest.fn().mockImplementation(() => ({
      commit: jest.fn().mockResolvedValue(null),
      rollback: jest.fn().mockResolvedValue(null),
    })),
    literal: jest.fn(),
  },
};

// Mock request object with session
const mockRequest = (userId = null) => ({
  session: {
    userId,
    destroy: jest.fn((cb) => cb()),
  },
});

// Mock context for resolvers
const mockContext = (userId = null) => ({
  db: mockModels,
  req: mockRequest(userId),
  sequelize: mockModels.sequelize,
});

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

module.exports = {
  mockModels,
  mockRequest,
  mockContext,
};
