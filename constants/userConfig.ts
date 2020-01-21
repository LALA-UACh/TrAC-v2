export const baseUserConfig: {
  SHOW_DROPOUT: boolean;
  SHOW_STUDENT_LIST: boolean;
  FOREPLAN: boolean;
  FOREPLAN_COURSE_STATS: boolean;
  FOREPLAN_COURSE_FAIL_RATE_STATS: boolean;
  FOREPLAN_COURSE_EFFORT_STATS: boolean;
} & Record<string, any> = {
  SHOW_DROPOUT: false,
  SHOW_STUDENT_LIST: false,
  FOREPLAN: false,
  FOREPLAN_COURSE_STATS: true,
  FOREPLAN_COURSE_FAIL_RATE_STATS: true,
  FOREPLAN_COURSE_EFFORT_STATS: true,
};

export type UserConfig = typeof baseUserConfig & Record<string, any>;
