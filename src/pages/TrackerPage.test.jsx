import { cleanup, render, screen, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  session: null,
  supabase: { auth: { signOut: vi.fn() } },
  ensureStats: vi.fn(),
  getActivityLog: vi.fn(),
  getAssignments: vi.fn(),
  getDailies: vi.fn(),
  getHabits: vi.fn(),
  getRewards: vi.fn(),
  getStats: vi.fn(),
  applyOverduePenalties: vi.fn(),
  getWeeklyEvents: vi.fn(),
  getDismissedReviews: vi.fn(),
  dismissWeeklyReview: vi.fn(),
  updateAssignmentSubtasks: vi.fn(),
  updateSubtaskTime: vi.fn(),
}));

vi.mock("../hooks/useAuth", () => ({ useAuth: () => mocks.session }));
vi.mock("../lib/supabase", () => ({ get supabase() { return mocks.supabase; } }));
vi.mock("../services/tracker", () => ({
  completeAssignment: vi.fn(),
  completeDaily: vi.fn(),
  createAssignment: vi.fn(),
  createDaily: vi.fn(),
  createHabit: vi.fn(),
  createReward: vi.fn(),
  deleteAssignment: vi.fn(),
  deleteDaily: vi.fn(),
  deleteHabit: vi.fn(),
  deleteReward: vi.fn(),
  ensureStats: mocks.ensureStats,
  getActivityLog: mocks.getActivityLog,
  getAssignments: mocks.getAssignments,
  getDailies: mocks.getDailies,
  getHabits: mocks.getHabits,
  getRewards: mocks.getRewards,
  getStats: mocks.getStats,
  applyOverduePenalties: mocks.applyOverduePenalties,
  getWeeklyEvents: mocks.getWeeklyEvents,
  getDismissedReviews: mocks.getDismissedReviews,
  dismissWeeklyReview: mocks.dismissWeeklyReview,
  updateAssignmentSubtasks: mocks.updateAssignmentSubtasks,
  updateSubtaskTime: mocks.updateSubtaskTime,
  logHabit: vi.fn(),
  redeemReward: vi.fn(),
}));
vi.mock("../components/tracker/AssignmentsPanel", () => ({ AssignmentsPanel: () => null }));
vi.mock("../components/tracker/DailiesPanel", () => ({ DailiesPanel: () => null }));
vi.mock("../components/tracker/HabitPanel", () => ({ HabitPanel: () => null }));
vi.mock("../components/tracker/RewardsPanel", () => ({ RewardsPanel: () => null }));
vi.mock("../components/tracker/TrackerModal", () => ({ TrackerModal: () => null }));

const stats = {
  level: 3,
  hp: 80,
  hp_max: 100,
  xp: 20,
  xp_to_next: 50,
  gold: 12,
};

async function renderTracker({ ownerId = "", session = null, activity = [], supabaseAvailable = true } = {}) {
  vi.stubEnv("VITE_OWNER_USER_ID", ownerId);
  vi.resetModules();
  mocks.session = session;
  mocks.supabase = supabaseAvailable ? { auth: { signOut: vi.fn() } } : null;
  mocks.ensureStats.mockResolvedValue(undefined);
  mocks.getActivityLog.mockResolvedValue(activity);
  mocks.getAssignments.mockResolvedValue([]);
  mocks.getDailies.mockResolvedValue([]);
  mocks.getHabits.mockResolvedValue([]);
  mocks.getRewards.mockResolvedValue([]);
  mocks.getStats.mockResolvedValue(stats);
  mocks.applyOverduePenalties.mockResolvedValue([]);
  mocks.getWeeklyEvents.mockResolvedValue([]);
  mocks.getDismissedReviews.mockResolvedValue([]);
  const { default: TrackerPage } = await import("./TrackerPage");
  return render(<TrackerPage />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

test("explains missing owner configuration to signed-out visitors instead of showing zero data", async () => {
  await renderTracker();

  expect(await screen.findByRole("alert")).toHaveTextContent("VITE_OWNER_USER_ID");
  expect(screen.getByRole("status")).toHaveTextContent("Heatmap unavailable");
  expect(mocks.getStats).not.toHaveBeenCalled();
});

test("loads public stats for signed-out visitors using the configured owner ID", async () => {
  await renderTracker({ ownerId: "owner-uuid" });

  await waitFor(() => expect(mocks.getStats).toHaveBeenCalledWith("owner-uuid", { throwOnError: true }));
  expect(await screen.findByText("12")).toBeInTheDocument();
  expect(screen.getByText("0d")).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "0 tracked actions in the last 52 weeks" })).toBeInTheDocument();
});

test("explains missing Supabase client settings", async () => {
  await renderTracker({ ownerId: "owner-uuid", supabaseAvailable: false });

  expect(await screen.findByRole("alert")).toHaveTextContent("VITE_SUPABASE_URL");
  expect(screen.getByRole("status")).toHaveTextContent("Heatmap unavailable");
  expect(mocks.getStats).not.toHaveBeenCalled();
});

test("uses the signed-in session ID when the owner ID is absent", async () => {
  await renderTracker({ session: { user: { id: "signed-in-owner" } } });

  await waitFor(() => expect(mocks.getStats).toHaveBeenCalledWith("signed-in-owner", { throwOnError: true }));
  expect(await screen.findByText("LV 3")).toBeInTheDocument();
});

test("shows a read failure instead of presenting an empty heatmap as real data", async () => {
  mocks.getActivityLog.mockRejectedValueOnce(new Error("permission denied"));
  await renderTracker({ ownerId: "owner-uuid" });

  expect(await screen.findByRole("alert")).toHaveTextContent("Could not load public tracker data");
  expect(screen.getByRole("status")).toHaveTextContent("Heatmap unavailable");
  expect(screen.queryByRole("img", { name: /tracked actions in the last 52 weeks/ })).not.toBeInTheDocument();
});
