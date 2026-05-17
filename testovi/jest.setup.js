// mock za uuid (rjesava bug s njime)
jest.mock("uuid", () => ({
  v4: () => "mocked-uuid-1234-5678-90ab-cdef",
}));
