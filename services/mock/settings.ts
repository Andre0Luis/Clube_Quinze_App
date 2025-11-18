let mockEnabled = false;

export const isMockEnabled = () => mockEnabled;

export const setMockEnabled = (value: boolean) => {
  mockEnabled = value;
};

export const toggleMock = () => {
  mockEnabled = !mockEnabled;
  return mockEnabled;
};
