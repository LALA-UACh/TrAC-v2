export const baseUserConfig: {
  SHOW_DROPOUT: boolean;
  SHOW_STUDENT_LIST: boolean;
  FOREPLAN: boolean;
} & Record<string, any> = {
  SHOW_DROPOUT: false,
  SHOW_STUDENT_LIST: false,
  FOREPLAN: false,
};

export type UserConfig = typeof baseUserConfig & Record<string, any>;
