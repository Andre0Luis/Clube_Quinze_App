import {
    AdminDashboardResponse,
    AppointmentRequest,
    AppointmentRescheduleRequest,
    AppointmentResponse,
    AppointmentStatusUpdateRequest,
    AppointmentTier,
    CommentRequest,
    CommentResponse,
    DashboardMetric,
    FeedbackAverageResponse,
    FeedbackRequest,
    FeedbackResponse,
    LikeResponse,
    LoginRequest,
    MembershipTier,
    PageResponse,
    PlanRequest,
    PlanResponse,
    PlanSummary,
    PostRequest,
    PostResponse,
    PreferenceRequest,
    PreferenceResponse,
    RefreshTokenRequest,
    RegisterRequest,
    UpdateUserRequest,
    UserPerformanceSummary,
    UserProfileResponse,
} from "../../types/api";

const addDays = (days: number, hour = 10, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const nowIso = new Date().toISOString();
const upcomingMorningIso = addDays(1, 10, 30);
const upcomingEveningIso = addDays(3, 18, 0);
const selectTierIso = addDays(7, 11, 0);
const completedIso = addDays(-3, 15, 30);
const canceledIso = addDays(-10, 9, 0);

const basePlan: PlanResponse = {
  id: 1,
  name: "Plano Padrao",
  description: "Plano padrao para manter o autocuidado em dia",
  price: 99.9,
  durationMonths: 12,
};

const premiumPlan: PlanResponse = {
  id: 2,
  name: "Plano Premium",
  description: "Inclui tratamentos exclusivos e vantagens no agendamento",
  price: 189.9,
  durationMonths: 12,
};

const selectPlan: PlanResponse = {
  id: 3,
  name: "Quinze Select",
  description:
    "Experiencia completa com agenda preferencial e eventos exclusivos",
  price: 289.9,
  durationMonths: 12,
};

const plans: PlanSummary[] = [basePlan, premiumPlan, selectPlan];

export type MockPersona = "ADMIN" | MembershipTier;

type PersonaPreset = {
  id: MockPersona;
  label: string;
  role: UserProfileResponse["role"];
  membershipTier: UserProfileResponse["membershipTier"];
  plan: PlanResponse;
  email: string;
  name: string;
  phone: string;
  description: string;
};

const personaPresets: Record<MockPersona, PersonaPreset> = {
  ADMIN: {
    id: "ADMIN",
    label: "Admin",
    role: "CLUB_ADMIN",
    membershipTier: "QUINZE_PREMIUM",
    plan: premiumPlan,
    email: "admin@clubequinze.com",
    name: "Admin Clube Quinze",
    phone: "+55 11 90000-0001",
    description: "Perfil administrativo para testar dashboards e gestão",
  },
  QUINZE_STANDARD: {
    id: "QUINZE_STANDARD",
    label: "Clube 15",
    role: "CLIENT",
    membershipTier: "QUINZE_STANDARD",
    plan: basePlan,
    email: "cliente@clubequinze.com",
    name: "Cliente Clube 15",
    phone: "+55 11 90000-0015",
    description: "Cliente convencional do Clube Quinze",
  },
  QUINZE_PREMIUM: {
    id: "QUINZE_PREMIUM",
    label: "Clube 15 Premium",
    role: "CLIENT",
    membershipTier: "QUINZE_PREMIUM",
    plan: premiumPlan,
    email: "premium@clubequinze.com",
    name: "Cliente Clube 15 Premium",
    phone: "+55 11 90000-0021",
    description: "Cliente premium com benef�cios extendidos",
  },
  QUINZE_SELECT: {
    id: "QUINZE_SELECT",
    label: "Quinze Select",
    role: "CLIENT",
    membershipTier: "QUINZE_SELECT",
    plan: selectPlan,
    email: "select@clubequinze.com",
    name: "Cliente Quinze Select",
    phone: "+55 11 90000-0029",
    description: "Cliente Select com benef�cios e agenda prioritaria",
  },
};

const basePreferences: PreferenceResponse[] = [
  {
    id: 1,
    key: "bebida",
    value: "cafe",
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: 2,
    key: "musica",
    value: "jazz_lounge",
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: 3,
    key: "profissional",
    value: "thiago_santos",
    createdAt: nowIso,
    updatedAt: nowIso,
  },
];

const appointments: AppointmentResponse[] = [
  {
    id: 1,
    clientId: 1,
    scheduledAt: upcomingMorningIso,
    appointmentTier: "QUINZE_STANDARD",
    status: "SCHEDULED",
    serviceType: "corte_de_cabelo",
    notes: "Cliente prefere silencio e acabamento com navalha.",
  },
  {
    id: 2,
    clientId: 1,
    scheduledAt: upcomingEveningIso,
    appointmentTier: "QUINZE_STANDARD",
    status: "SCHEDULED",
    serviceType: "barba",
    notes: "Usar oleo refrescante e toalha quente.",
  },
  {
    id: 3,
    clientId: 1,
    scheduledAt: selectTierIso,
    appointmentTier: "QUINZE_SELECT",
    status: "SCHEDULED",
    serviceType: "tratamento_capilar",
    notes: "Aplicar linha Select e massagem relaxante.",
  },
  {
    id: 4,
    clientId: 1,
    scheduledAt: completedIso,
    appointmentTier: "QUINZE_STANDARD",
    status: "COMPLETED",
    serviceType: "corte_de_cabelo",
    notes: "Cliente avaliou com nota maxima.",
  },
  {
    id: 5,
    clientId: 1,
    scheduledAt: canceledIso,
    appointmentTier: "QUINZE_STANDARD",
    status: "CANCELED",
    serviceType: "barba",
    notes: "Cancelado pelo cliente via aplicativo.",
  },
  {
    id: 6,
    clientId: 1,
    scheduledAt: addDays(5, 17, 15),
    appointmentTier: "QUINZE_SELECT",
    status: "SCHEDULED",
    serviceType: "ajuste_de_barba_select",
    notes: "Cliente Select prefere finalizacao com oleo quente.",
  },
  {
    id: 7,
    clientId: 1,
    scheduledAt: addDays(-7, 13, 0),
    appointmentTier: "QUINZE_STANDARD",
    status: "COMPLETED",
    serviceType: "limpeza_de_pele",
    notes: "Sessao completa de skincare com esfoliacao.",
  },
  {
    id: 8,
    clientId: 1,
    scheduledAt: addDays(12, 19, 0),
    appointmentTier: "QUINZE_SELECT",
    status: "SCHEDULED",
    serviceType: "barbearia_noturna",
    notes: "Horario extra premium para Select apos expediente.",
  },
  {
    id: 9,
    clientId: 1,
    scheduledAt: addDays(-20, 10, 30),
    appointmentTier: "QUINZE_STANDARD",
    status: "CANCELED",
    serviceType: "corte_rapido",
    notes: "Cancelado por manutencao do espaco.",
  },
];

const baseAppointment: AppointmentResponse = appointments[0];

let currentPersona: MockPersona = "QUINZE_STANDARD";

const buildBaseUser = (persona: MockPersona): UserProfileResponse => {
  const preset = personaPresets[persona];
  return {
    id: 1,
    name: preset.name,
    email: preset.email,
    phone: preset.phone,
    birthDate: "1992-08-15",
    membershipTier: preset.membershipTier,
    role: preset.role,
    plan: preset.plan,
    createdAt: nowIso,
    lastLogin: nowIso,
    nextAppointment:
      appointments.find(
        (item) =>
          item.status === "SCHEDULED" &&
          new Date(item.scheduledAt) >= new Date(),
      ) ?? baseAppointment,
    preferences: basePreferences,
    profilePictureUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
    profilePictureBase64: undefined,
    gallery: [
      {
        position: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=800&q=80",
      },
      {
        position: 2,
        imageUrl:
          "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80",
      },
    ],
  };
};

let baseUser: UserProfileResponse = buildBaseUser(currentPersona);

const sortByScheduleAsc = (
  first: AppointmentResponse,
  second: AppointmentResponse,
) =>
  new Date(first.scheduledAt).getTime() -
  new Date(second.scheduledAt).getTime();

const getNextAppointmentId = () =>
  appointments.reduce((max, item) => Math.max(max, item.id), 0) + 1;

const updateNextAppointment = () => {
  const upcoming = appointments
    .filter(
      (item) =>
        item.status === "SCHEDULED" &&
        new Date(item.scheduledAt).getTime() >= Date.now(),
    )
    .sort(sortByScheduleAsc);
  baseUser.nextAppointment = upcoming[0] ?? null;
};

updateNextAppointment();

export const getMockPersona = () => currentPersona;

export const setMockPersona = (persona: MockPersona) => {
  currentPersona = persona;
  baseUser = buildBaseUser(persona);
  updateNextAppointment();
};

export const getMockPersonaOptions = () =>
  Object.values(personaPresets).map((preset) => ({
    id: preset.id,
    label: preset.label,
    description: preset.description,
    membershipTier: preset.membershipTier,
    role: preset.role,
    email: preset.email,
  }));

export const getMockPersonaCredentials = (persona: MockPersona) => ({
  email: personaPresets[persona].email,
  password: "1234",
});

const feedbackEntries: FeedbackResponse[] = [
  {
    id: 1,
    appointmentId: 4,
    userId: 1,
    rating: 5,
    comment: "serviço excelente, corte impecavel.",
    createdAt: nowIso,
  },
  {
    id: 2,
    appointmentId: 5,
    userId: 1,
    rating: 4,
    comment: "Equipe atenciosa, apenas atraso na agenda.",
    createdAt: addDays(-12, 11, 0),
  },
  {
    id: 3,
    appointmentId: 3,
    userId: 1,
    rating: 5,
    comment: "Tratamento capilar deixou o cabelo otimo.",
    createdAt: addDays(-1, 19, 15),
  },
  {
    id: 4,
    appointmentId: 7,
    userId: 1,
    rating: 3,
    comment: "Atendimento bom, mas poderia ser mais rapido.",
    createdAt: addDays(-6, 10, 45),
  },
];

const posts: PostResponse[] = [
  {
    id: 1,
    authorId: 1,
    title: "Bem-vindo ao Clube Quinze",
    content:
      "Compartilhe experiencias e descubra novidades com outros membros.",
    media: [
      {
        position: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
      },
    ],
    createdAt: nowIso,
    updatedAt: nowIso,
    likeCount: 3,
    comments: [
      {
        id: 1,
        postId: 1,
        authorId: 2,
        content: "Muito bom ver a comunidade ativa!",
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: 2,
        postId: 1,
        authorId: 3,
        content: "Contem comigo para os próximos eventos.",
        createdAt: addDays(-2, 17, 45),
        updatedAt: addDays(-2, 17, 45),
      },
    ],
  },
  {
    id: 2,
    authorId: 3,
    title: "Agenda especial de fim de semana",
    content: "Abrimos horarios extras no sabado para membros Select.",
    media: [
      {
        position: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
      },
      {
        position: 2,
        imageUrl:
          "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
      },
    ],
    createdAt: addDays(-1, 9, 30),
    updatedAt: addDays(-1, 9, 30),
    likeCount: 5,
    comments: [
      {
        id: 3,
        postId: 2,
        authorId: 1,
        content: "Ja garanti meu horario!",
        createdAt: addDays(-1, 10, 5),
        updatedAt: addDays(-1, 10, 5),
      },
    ],
  },
  {
    id: 3,
    authorId: 4,
    title: "Lembrete de avaliacao",
    content: "Avalie seu atendimento e ajude a melhorar nossos serviços.",
    media: [],
    createdAt: addDays(-5, 12, 0),
    updatedAt: addDays(-5, 12, 0),
    likeCount: 2,
    comments: [],
  },
  {
    id: 4,
    authorId: 2,
    title: "Nova barbearia conceito",
    content:
      "Conheca o novo ambiente com cabines privativas e mixologia autoral.",
    media: [
      {
        position: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      },
    ],
    createdAt: addDays(-8, 16, 45),
    updatedAt: addDays(-8, 16, 45),
    likeCount: 7,
    comments: [
      {
        id: 4,
        postId: 4,
        authorId: 5,
        content: "Ja quero agendar uma visita!",
        createdAt: addDays(-8, 17, 5),
        updatedAt: addDays(-8, 17, 5),
      },
    ],
  },
];

const likes: LikeResponse[] = [
  {
    id: 1,
    postId: 1,
    userId: 1,
    createdAt: nowIso,
  },
  {
    id: 2,
    postId: 2,
    userId: 1,
    createdAt: addDays(-1, 10, 5),
  },
  {
    id: 3,
    postId: 1,
    userId: 4,
    createdAt: addDays(-3, 14, 20),
  },
  {
    id: 4,
    postId: 1,
    userId: 2,
    createdAt: addDays(-4, 13, 0),
  },
  {
    id: 5,
    postId: 2,
    userId: 3,
    createdAt: addDays(-1, 11, 15),
  },
  {
    id: 6,
    postId: 2,
    userId: 4,
    createdAt: addDays(-1, 12, 0),
  },
  {
    id: 7,
    postId: 2,
    userId: 5,
    createdAt: addDays(-1, 12, 30),
  },
  {
    id: 10,
    postId: 2,
    userId: 6,
    createdAt: addDays(-1, 12, 45),
  },
  {
    id: 8,
    postId: 3,
    userId: 1,
    createdAt: addDays(-5, 13, 45),
  },
  {
    id: 9,
    postId: 3,
    userId: 2,
    createdAt: addDays(-5, 14, 10),
  },
  {
    id: 11,
    postId: 4,
    userId: 2,
    createdAt: addDays(-8, 17, 10),
  },
  {
    id: 12,
    postId: 4,
    userId: 3,
    createdAt: addDays(-8, 17, 20),
  },
];

const calculateUserAverage = (userId: number) => {
  const userFeedback = feedbackEntries.filter(
    (entry) => entry.userId === userId,
  );
  if (!userFeedback.length) {
    return 0;
  }
  const sum = userFeedback.reduce(
    (total, entry) => total + (entry.rating ?? 0),
    0,
  );
  return Number((sum / userFeedback.length).toFixed(2));
};

const countCompletedAppointments = (userId: number) =>
  appointments.filter(
    (item) => item.clientId === userId && item.status === "COMPLETED",
  ).length;

const countUpcomingAppointments = (userId: number) => {
  const now = Date.now();
  return appointments.filter((item) => {
    if (item.clientId !== userId || item.status !== "SCHEDULED") {
      return false;
    }
    const scheduledDate = new Date(item.scheduledAt).getTime();
    return !Number.isNaN(scheduledDate) && scheduledDate >= now;
  }).length;
};

const getLastFeedbackDate = (userId: number) => {
  const userFeedback = feedbackEntries
    .filter((entry) => entry.userId === userId)
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    );
  return userFeedback[0]?.createdAt ?? null;
};

const calculateServiceRatings = () => {
  const serviceStats = new Map<string, { total: number; count: number }>();

  feedbackEntries.forEach((entry) => {
    const appointment = appointments.find(
      (item) => item.id === entry.appointmentId,
    );
    if (!appointment) {
      return;
    }
    const serviceKey = appointment.serviceType ?? "serviço";
    const rating = entry.rating ?? 0;
    if (!rating) {
      return;
    }
    const next = serviceStats.get(serviceKey) ?? { total: 0, count: 0 };
    next.total += rating;
    next.count += 1;
    serviceStats.set(serviceKey, next);
  });

  if (!serviceStats.size) {
    const fallback = new Map<string, { total: number; count: number }>();
    appointments.forEach((appointment) => {
      const serviceKey = appointment.serviceType ?? "serviço";
      const next = fallback.get(serviceKey) ?? { total: 0, count: 0 };
      next.total += 4.5;
      next.count += 1;
      fallback.set(serviceKey, next);
    });
    return Array.from(fallback.entries()).map(([service, stats]) => ({
      service,
      average: Number((stats.total / stats.count).toFixed(2)),
    }));
  }

  return Array.from(serviceStats.entries())
    .map(([service, { total, count }]) => ({
      service,
      average: Number((total / count).toFixed(2)),
    }))
    .sort((first, second) => second.average - first.average);
};

const userPage = <T>(items: T[]): PageResponse<T> => ({
  content: items,
  totalElements: items.length,
  totalPages: 1,
  page: 0,
  size: items.length,
});

export const mockData = {
  getUserById: (userId: number) => baseUser,
  updateUserById: (userId: number, payload: UpdateUserRequest) => {
    baseUser.name = payload.name;
    baseUser.email = payload.email;
    baseUser.phone = payload.phone ?? baseUser.phone;
    baseUser.birthDate = payload.birthDate ?? baseUser.birthDate;
    baseUser.membershipTier = payload.membershipTier;
    if (payload.planId) {
      const plan = plans.find((item) => item.id === payload.planId);
      if (plan) {
        baseUser.plan = plan;
      }
    }
    if (payload.profilePictureUrl !== undefined) {
      baseUser.profilePictureUrl = payload.profilePictureUrl ?? undefined;
    }
    if (payload.profilePictureBase64 !== undefined) {
      baseUser.profilePictureBase64 = payload.profilePictureBase64 ?? undefined;
    }
    if (payload.gallery !== undefined) {
      const sanitizedGallery = payload.gallery
        .filter((item) => item.imageUrl || item.imageBase64)
        .map((item, index) => ({
          position: index + 1,
          imageUrl: item.imageUrl ?? null,
          imageBase64: item.imageBase64 ?? null,
        }));
      baseUser.gallery = sanitizedGallery;
    }
    return baseUser;
  },
  getCurrentUser: () => baseUser,
  updateCurrentUser: (payload: UpdateUserRequest) => {
    baseUser.name = payload.name;
    baseUser.email = payload.email;
    baseUser.phone = payload.phone ?? baseUser.phone;
    baseUser.birthDate = payload.birthDate ?? baseUser.birthDate;
    baseUser.membershipTier = payload.membershipTier;
    if (payload.planId) {
      const plan = plans.find((item) => item.id === payload.planId);
      if (plan) {
        baseUser.plan = plan;
      }
    }
    if (payload.profilePictureUrl !== undefined) {
      baseUser.profilePictureUrl = payload.profilePictureUrl ?? undefined;
    }
    if (payload.profilePictureBase64 !== undefined) {
      baseUser.profilePictureBase64 = payload.profilePictureBase64 ?? undefined;
    }
    if (payload.gallery !== undefined) {
      const sanitizedGallery = payload.gallery
        .filter((item) => item.imageUrl || item.imageBase64)
        .map((item, index) => ({
          position: index + 1,
          imageUrl: item.imageUrl ?? null,
          imageBase64: item.imageBase64 ?? null,
        }));
      baseUser.gallery = sanitizedGallery;
    }
    return baseUser;
  },
  listPreferences: (userId?: number) => basePreferences,
  upsertPreference: (payload: PreferenceRequest) => {
    const preference: PreferenceResponse = {
      id: basePreferences.length + 1,
      key: payload.key,
      value: payload.value,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    basePreferences.push(preference);
    return preference;
  },
  updatePreference: (preferenceId: number, payload: PreferenceRequest) => {
    const index = basePreferences.findIndex((item) => item.id === preferenceId);
    const preference: PreferenceResponse = {
      id: preferenceId,
      key: payload.key,
      value: payload.value,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (index >= 0) {
      basePreferences[index] = preference;
    } else {
      basePreferences.push(preference);
    }

    return preference;
  },
  deletePreference: (preferenceId: number) => {
    const index = basePreferences.findIndex((item) => item.id === preferenceId);
    if (index >= 0) {
      basePreferences.splice(index, 1);
    }
  },
  createPlan: (payload: PlanRequest) => {
    const plan: PlanResponse = {
      id: plans.length + 1,
      ...payload,
    };
    plans.push(plan);
    return plan;
  },
  updatePlan: (planId: number, payload: PlanRequest) => {
    const plan: PlanResponse = {
      id: planId,
      ...payload,
    };
    const index = plans.findIndex((item) => item.id === planId);
    if (index >= 0) {
      plans[index] = plan;
    } else {
      plans.push(plan);
    }
    return plan;
  },
  deletePlan: (planId: number) => {
    const index = plans.findIndex((item) => item.id === planId);
    if (index >= 0) {
      plans.splice(index, 1);
    }
  },
  listPlans: () => plans,
  listAppointments: () => userPage([...appointments].sort(sortByScheduleAsc)),
  scheduleAppointment: (payload: AppointmentRequest) => {
    const appointment: AppointmentResponse = {
      id: getNextAppointmentId(),
      clientId: payload.clientId,
      scheduledAt: payload.scheduledAt,
      appointmentTier: payload.appointmentTier,
      status: "SCHEDULED",
      serviceType: payload.serviceType ?? "corte_de_cabelo",
      notes: payload.notes,
    };
    appointments.push(appointment);
    updateNextAppointment();
    return appointment;
  },
  listMyAppointments: () => userPage([...appointments].sort(sortByScheduleAsc)),
  getAppointmentById: (appointmentId: number) =>
    appointments.find((item) => item.id === appointmentId) ?? baseAppointment,
  rescheduleAppointment: (
    appointmentId: number,
    payload: AppointmentRescheduleRequest,
  ) => {
    const index = appointments.findIndex((item) => item.id === appointmentId);
    if (index < 0) {
      return appointments[0];
    }
    const updated: AppointmentResponse = {
      ...appointments[index],
      scheduledAt: payload.newDate,
      notes: payload.notes ?? appointments[index].notes,
    };
    appointments[index] = updated;
    updateNextAppointment();
    return updated;
  },
  updateAppointmentStatus: (
    appointmentId: number,
    payload: AppointmentStatusUpdateRequest,
  ) => {
    const index = appointments.findIndex((item) => item.id === appointmentId);
    if (index < 0) {
      return appointments[0];
    }
    const updated: AppointmentResponse = {
      ...appointments[index],
      status: payload.status,
      notes: payload.notes ?? appointments[index].notes,
    };
    appointments[index] = updated;
    updateNextAppointment();
    return updated;
  },
  cancelAppointment: (appointmentId: number) => {
    const index = appointments.findIndex((item) => item.id === appointmentId);
    if (index >= 0) {
      appointments.splice(index, 1);
      updateNextAppointment();
    }
  },
  listAvailableSlots: (date: string, tier?: AppointmentTier) => {
    const baseTimes = ["10:00", "11:30", "14:00", "16:30"];
    const tierExtras = tier === "QUINZE_SELECT" ? ["18:00", "19:30"] : [];
    const times = [...baseTimes, ...tierExtras];
    const availableSlots = times.map((time) =>
      new Date(`${date}T${time}:00-03:00`).toISOString(),
    );
    return {
      date,
      membershipTier: tier ?? "QUINZE_STANDARD",
      availableSlots,
    };
  },
  submitFeedback: (payload: FeedbackRequest) => {
    const feedback: FeedbackResponse = {
      id: feedbackEntries.length + 1,
      appointmentId: payload.appointmentId,
      userId: 1,
      rating: payload.rating,
      comment: payload.comment,
      createdAt: nowIso,
    };
    feedbackEntries.push(feedback);
    return feedback;
  },
  listFeedback: () => userPage(feedbackEntries),
  listMyFeedback: () => userPage(feedbackEntries),
  getUserAverage: (userId: number) => calculateUserAverage(userId),
  getUserSummary: (userId: number): UserPerformanceSummary => {
    return {
      averageRating: calculateUserAverage(userId),
      completedAppointments: countCompletedAppointments(userId),
      upcomingAppointments: countUpcomingAppointments(userId),
      lastFeedbackAt: getLastFeedbackDate(userId),
    };
  },
  getAdminDashboard: (): AdminDashboardResponse => {
    const now = Date.now();
    const uniqueMembers =
      new Set(appointments.map((item) => item.clientId)).size || 1;
    const upcomingAppointmentsCount = appointments.filter((item) => {
      if (item.status !== "SCHEDULED") {
        return false;
      }
      const date = new Date(item.scheduledAt).getTime();
      return !Number.isNaN(date) && date >= now;
    }).length;
    const completedAppointmentsCount = appointments.filter(
      (item) => item.status === "COMPLETED",
    ).length;
    const canceledAppointmentsCount = appointments.filter(
      (item) => item.status === "CANCELED",
    ).length;
    const satisfactionScore = feedbackEntries.length
      ? Number(
          (
            feedbackEntries.reduce(
              (total, entry) => total + (entry.rating ?? 0),
              0,
            ) / feedbackEntries.length
          ).toFixed(2),
        )
      : 0;
    const pendingFeedbackCount = Math.max(
      0,
      completedAppointmentsCount - feedbackEntries.length,
    );

    const metrics: DashboardMetric[] = [
      {
        id: "appointments_total",
        label: "Atendimentos",
        value: appointments.length,
      },
      {
        id: "appointments_completed",
        label: "concluídos",
        value: completedAppointmentsCount,
      },
      {
        id: "appointments_canceled",
        label: "Cancelados",
        value: canceledAppointmentsCount,
      },
      {
        id: "feedback_total",
        label: "Feedbacks coletados",
        value: feedbackEntries.length,
      },
    ];

    const topServices = calculateServiceRatings().slice(0, 4);

    const recentAppointments = [...appointments]
      .sort(
        (first, second) =>
          new Date(second.scheduledAt).getTime() -
          new Date(first.scheduledAt).getTime(),
      )
      .slice(0, 5);

    return {
      totalMembers: Math.max(uniqueMembers, 28),
      activePlans: plans.length,
      upcomingAppointments: upcomingAppointmentsCount,
      pendingFeedback: pendingFeedbackCount,
      satisfactionScore,
      metrics,
      topServices,
      recentAppointments,
    };
  },
  getAverageByService: () =>
    <FeedbackAverageResponse[]>[
      { target: "corte_de_cabelo", average: 4.9 },
      { target: "barba", average: 4.6 },
      { target: "tratamento_capilar", average: 4.8 },
    ],
  listPosts: () => userPage(posts),
  createPost: (payload: PostRequest) => {
    const post: PostResponse = {
      id: posts.length + 1,
      authorId: 1,
      title: payload.title,
      content: payload.content,
      media: payload.media
        ? [...payload.media].sort(
            (first, second) => first.position - second.position,
          )
        : [],
      createdAt: nowIso,
      updatedAt: nowIso,
      likeCount: 0,
      comments: [],
    };
    posts.push(post);
    return post;
  },
  getPost: (postId: number) =>
    posts.find((item) => item.id === postId) ?? posts[0],
  deletePost: (postId: number) => {
    const index = posts.findIndex((item) => item.id === postId);
    if (index >= 0) {
      posts.splice(index, 1);
    }
  },
  likePost: (postId: number) => {
    const like: LikeResponse = {
      id: likes.length + 1,
      postId,
      userId: 1,
      createdAt: nowIso,
    };
    likes.push(like);
    const post = posts.find((item) => item.id === postId);
    if (post) {
      post.likeCount += 1;
    }
    return like;
  },
  unlikePost: (postId: number) => {
    const likeIndex = likes.findIndex(
      (item) => item.postId === postId && item.userId === 1,
    );
    if (likeIndex >= 0) {
      likes.splice(likeIndex, 1);
    }
    const post = posts.find((item) => item.id === postId);
    if (post && post.likeCount > 0) {
      post.likeCount -= 1;
    }
  },
  addComment: (postId: number, payload: CommentRequest) => {
    const comment: CommentResponse = {
      id: posts.reduce((count, post) => count + post.comments.length, 0) + 1,
      postId,
      authorId: 1,
      content: payload.content,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    const post = posts.find((item) => item.id === postId);
    if (post) {
      post.comments.push(comment);
    }
    return comment;
  },
  deleteComment: (postId: number, commentId: number) => {
    const post = posts.find((item) => item.id === postId);
    if (!post) return;
    const index = post.comments.findIndex((c) => c.id === commentId);
    if (index >= 0) {
      post.comments.splice(index, 1);
    }
  },
  register: (payload: RegisterRequest) => ({
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    tokenType: "Bearer",
  }),
  login: (payload: LoginRequest) => {
    if (payload.email !== baseUser.email || payload.password !== "1234") {
      throw new Error("Credenciais invalidas");
    }

    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      tokenType: "Bearer",
    };
  },
  refresh: (payload: RefreshTokenRequest) => ({
    accessToken: "mock-access-token-2",
    refreshToken: payload.refreshToken,
    tokenType: "Bearer",
  }),
  logout: (payload: RefreshTokenRequest) => undefined,
};

