export const baseUserConfig: {
  SHOW_DROPOUT: boolean;
  SHOW_STUDENT_LIST: boolean;
  FOREPLAN: boolean;
  FOREPLAN_COURSE_STATS: boolean;
  FOREPLAN_COURSE_FAIL_RATE_STATS: boolean;
  FOREPLAN_COURSE_EFFORT_STATS: boolean;
  FOREPLAN_SUMMARY_LIST: boolean;
  FOREPLAN_SUMMARY_BADGES: boolean;
  FOREPLAN_SUMMARY_WAFFLE_CHART: boolean;
  FOREPLAN_SUMMARY_ADVICE: boolean;
} & Record<string, any> = {
  SHOW_DROPOUT: false,
  SHOW_STUDENT_LIST: false,
  FOREPLAN: false,
  FOREPLAN_COURSE_STATS: true,
  FOREPLAN_COURSE_FAIL_RATE_STATS: true,
  FOREPLAN_COURSE_EFFORT_STATS: true,
  FOREPLAN_SUMMARY_LIST: false,
  FOREPLAN_SUMMARY_BADGES: true,
  FOREPLAN_SUMMARY_WAFFLE_CHART: true,
  FOREPLAN_SUMMARY_ADVICE: true,
};

export type UserConfig = typeof baseUserConfig & Record<string, any>;
