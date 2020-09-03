// This file is intented to be used simply calling "yarn" or "yarn migrate"

import type { FeedbackQuestionOption } from "../entities/feedback";
import type { FeedbackQuestionType } from "../../constants";

const migration = async () => {
  const { FeedbackQuestionType, UserType } = await import("../../constants");
  const { baseDBConfig, dbNames } = await import("./config");

  const knexDB = (await import("knex")).default(baseDBConfig);

  const createdDatabases = Object.values(dbNames);
  for (const dbName of Object.values(dbNames)) {
    try {
      await knexDB.raw(`CREATE DATABASE "${dbName}";`);
    } catch (err) {
      // Expected possible error, duplicated database, database already exists.
      // https://www.postgresql.org/docs/8.2/errcodes-appendix.html
      if (err.code === "42P04") {
        createdDatabases.splice(createdDatabases.indexOf(dbName), 1);
      } else {
        const { serializeError } = await import("serialize-error");

        console.error(serializeError(err));
        await knexDB.destroy();
        process.exit(1);
      }
    }
  }

  if (createdDatabases.length) {
    console.info(
      `CREATED "${createdDatabases.join(" | ")}" DATABASE${
        createdDatabases.length > 1 ? "S" : ""
      }!`
    );
  }

  await knexDB.destroy();

  const sha1 = (await import("crypto-js/sha1")).default;
  const { chunk, sample } = await import("lodash");

  const { baseUserConfig } = await import("../../constants/userConfig");
  const {
    joinFeedbackQuestionOptions,
    splitFeedbackQuestionOptions,
  } = await import("../resolvers/feedback/utils");
  const { dbAuth, dbConfig, dbData, dbTracking } = await import("./index");
  const {
    CONFIGURATION_TABLE,
    COURSE_STATS_TABLE,
    COURSE_TABLE,
    CourseStatsTable,
    CourseTable,
    FEEDBACK_FORM_QUESTION_TABLE,
    FEEDBACK_FORM_TABLE,
    FEEDBACK_RESULT_TABLE,
    FeedbackFormQuestionTable,
    FeedbackFormTable,
    FeedbackResultTable,
    PARAMETER_TABLE,
    ParameterTable,
    PERFORMANCE_BY_LOAD_TABLE,
    PerformanceByLoadTable,
    PERSISTENCE_TABLE,
    PROGRAM_STRUCTURE_TABLE,
    PROGRAM_TABLE,
    ProgramStructureTable,
    ProgramTable,
    STUDENT_CLUSTER_TABLE,
    STUDENT_COURSE_TABLE,
    STUDENT_DROPOUT_TABLE,
    STUDENT_PROGRAM_TABLE,
    STUDENT_TABLE,
    STUDENT_TERM_TABLE,
    StudentClusterTable,
    StudentCourseTable,
    StudentDropoutTable,
    StudentProgramTable,
    StudentTable,
    StudentTermTable,
    TRACKING_TABLE,
    USER_CONFIGURATION_TABLE,
    USER_PROGRAMS_TABLE,
    UserConfigurationTable,
    UserProgramsTable,
    USERS_TABLE,
    UserTable,
  } = await import("./tables");

  const users = dbAuth.schema.hasTable(USERS_TABLE).then(async (exists) => {
    if (!exists) {
      await dbAuth.schema.createTable(USERS_TABLE, (table) => {
        table.text("email").primary();
        table.text("password").notNullable().defaultTo("");
        table.text("name").notNullable().defaultTo("Default");
        table.text("oldPassword1").notNullable().defaultTo("");
        table.text("oldPassword2").notNullable().defaultTo("");
        table.text("oldPassword3").notNullable().defaultTo("");
        table.boolean("locked").notNullable().defaultTo(true);
        table.integer("tries").notNullable().defaultTo(0);
        table.text("unlockKey").notNullable().defaultTo("");
        table.boolean("admin").notNullable().defaultTo(false);
        table
          .enum("type", Object.values(UserType))
          .notNullable()
          .defaultTo(UserType.Director);
        table.text("student_id").notNullable().defaultTo("");
      });

      await UserTable().insert({
        email: "admin@admin.dev",
        password: sha1("admin").toString(),
        name: "default admin",
        locked: false,
        admin: true,
        type: UserType.Director,
        student_id: (await import("./mockData/student.json")).default[0].id,
      });
    }
  });

  const usersPrograms = dbAuth.schema
    .hasTable(USER_PROGRAMS_TABLE)
    .then(async (exists) => {
      if (!exists) {
        await dbAuth.schema.createTable(USER_PROGRAMS_TABLE, (table) => {
          table.text("email");
          table.text("program");
          table.primary(["email", "program"]);
        });
        await UserProgramsTable().insert(
          (await import("./mockData/program.json")).default.map(({ id }) => {
            return {
              email: "admin@admin.dev",
              program: id.toString(),
            };
          })
        );
      }
    });

  const userConfig = dbConfig.schema
    .hasTable(USER_CONFIGURATION_TABLE)
    .then(async (exists) => {
      if (!exists) {
        await dbConfig.schema.createTable(USER_CONFIGURATION_TABLE, (table) => {
          table.text("email").primary().notNullable();
          table.json("config").notNullable();
        });

        await UserConfigurationTable().insert({
          email: "admin@admin.dev",
          config: {
            ...baseUserConfig,
            SHOW_DROPOUT: true,
            SHOW_STUDENT_LIST: true,
            FOREPLAN: true,
          },
        });
      }
    });

  const config = dbConfig.schema
    .hasTable(CONFIGURATION_TABLE)
    .then(async (exists) => {
      if (!exists) {
        await dbConfig.schema.createTable(CONFIGURATION_TABLE, (table) => {
          table.text("name").primary().defaultTo("");
          table.text("value").defaultTo("").notNullable();
        });
      }
    });

  const track = dbTracking.schema
    .hasTable(TRACKING_TABLE)
    .then(async (exists) => {
      if (!exists) {
        await dbTracking.schema.createTable(TRACKING_TABLE, (table) => {
          table.bigIncrements("id").primary().unsigned();
          table.text("app_id").notNullable().defaultTo("undefined");
          table.text("user_id").notNullable();
          table.timestamp("datetime", { useTz: true }).notNullable();
          table.timestamp("datetime_client", { useTz: true }).notNullable();
          table.text("data").notNullable();
        });
      }
    });

  const course = dbData.schema.hasTable(COURSE_TABLE).then(async (exists) => {
    if (!exists) {
      await dbData.schema.createTable(COURSE_TABLE, (table) => {
        table.text("id").notNullable().primary();
        table.text("name").notNullable();
        table.text("description").notNullable();
        table.text("tags").notNullable().defaultTo("");
        table.text("grading").notNullable();
        table.float("grade_min", 4).notNullable();
        table.float("grade_max", 4).notNullable();
        table.float("grade_pass_min", 4).notNullable();
      });

      await CourseTable().insert(
        (await import("./mockData/course.json")).default
      );
    }
  });

  const courseStats = dbData.schema
    .hasTable(COURSE_STATS_TABLE)
    .then(async (exists) => {
      if (!exists) {
        await dbData.schema.createTable(COURSE_STATS_TABLE, (table) => {
          table.text("course_taken").notNullable();
          table.integer("year", 4).notNullable();
          table.integer("term", 4).notNullable();
          table.integer("p_group", 2).notNullable();
          table.integer("n_total", 8).notNullable();
          table.integer("n_finished", 8).notNullable();
          table.integer("n_pass", 8).notNullable();
          table.integer("n_fail", 8).notNullable();
          table.integer("n_drop", 8).notNullable();
          table.text("histogram").notNullable();
          table.float("avg_grade").notNullable();
          table.integer("n_grades", 4).notNullable();
          table.integer("id", 8).primary().notNullable();
          table.text("histogram_labels").notNullable();
          table.text("color_bands").notNullable();
        });

        const dataToInsert = chunk(
          (await import("./mockData/course_stats.json")).default,
          500
        );

        for (const chunkData of dataToInsert) {
          await CourseStatsTable().insert(chunkData);
        }
      }
    });

  const param = dbData.schema.hasTable(PARAMETER_TABLE).then(async (exists) => {
    if (!exists) {
      await dbData.schema.createTable(PARAMETER_TABLE, (table) => {
        table.float("passing_grade", 8);
        table.timestamp("loading_date");
      });
      await ParameterTable().insert(
        (await import("./mockData/parameter.json")).default.map(
          ({ passing_grade, loading_date }) => {
            return {
              passing_grade,
              loading_date: new Date(loading_date),
            };
          }
        )
      );
    }
  });

  const program = dbData.schema.hasTable(PROGRAM_TABLE).then(async (exists) => {
    if (!exists) {
      await dbData.schema.createTable(PROGRAM_TABLE, (table) => {
        table.text("id").notNullable().primary();
        table.text("name").notNullable();
        table.text("desc").notNullable();
        table.text("tags").notNullable();
        table.boolean("active").notNullable().defaultTo(true);
        table.float("last_gpa", 4).notNullable().defaultTo(0);
      });
      await ProgramTable().insert(
        (await import("./mockData/program.json")).default.map(
          ({ id, ...rest }) => {
            return {
              ...rest,
              id: id.toString(),
            };
          }
        )
      );
    }
  });

  const programStructure = dbData.schema
    .hasTable(PROGRAM_STRUCTURE_TABLE)
    .then(async (exists) => {
      if (!exists) {
        await dbData.schema.createTable(PROGRAM_STRUCTURE_TABLE, (table) => {
          table.integer("id", 8).notNullable().primary();
          table.text("program_id").notNullable();
          table.text("curriculum").notNullable();
          table.integer("semester", 4).notNullable();
          table.text("course_id").notNullable();
          table.float("credits", 8).notNullable();
          table.text("requisites").defaultTo("").notNullable();
          table.text("mention").defaultTo("").notNullable();
          table.text("course_cat").defaultTo("").notNullable();
          table.text("mode").defaultTo("semestral").notNullable();
          table.float("credits_sct", 8).notNullable();
          table.text("tags").notNullable().defaultTo("");
        });
        await ProgramStructureTable().insert(
          (await import("./mockData/program_structure.json")).default.map(
            ({ program_id, curriculum, ...rest }) => {
              return {
                ...rest,
                program_id: program_id.toString(),
                curriculum: curriculum.toString(),
              };
            }
          )
        );
      }
    });

  const student = dbData.schema.hasTable(STUDENT_TABLE).then(async (exists) => {
    if (!exists) {
      await dbData.schema.createTable(STUDENT_TABLE, (table) => {
        table.text("id").notNullable().primary();
        table.text("name").notNullable();
        table.text("state").notNullable();
      });
      await StudentTable().insert(
        (await import("./mockData/student.json")).default
      );
    }
  });

  const studentCourse = dbData.schema
    .hasTable(STUDENT_COURSE_TABLE)
    .then(async (exists) => {
      if (!exists) {
        await dbData.schema.createTable(STUDENT_COURSE_TABLE, (table) => {
          table.integer("id", 8).notNullable().primary();
          table.integer("year", 4).notNullable();
          table.integer("term", 4).notNullable();
          table.text("student_id").notNullable();
          table.text("course_taken").notNullable();
          table.text("course_equiv").notNullable();
          table.text("elect_equiv").notNullable();
          table.text("registration").notNullable();
          table.text("state").notNullable();
          table.float("grade", 8).notNullable();
          table.integer("p_group", 2).notNullable();
          table.text("comments").notNullable();
          table.text("instructors").notNullable();
          table.integer("duplicates", 8).notNullable();
        });
        await StudentCourseTable().insert(
          (await import("./mockData/student_course.json")).default
        );
      }
    });

  const studentDropout = dbData.schema
    .hasTable(STUDENT_DROPOUT_TABLE)
    .then(async (exists) => {
      if (!exists) {
        await dbData.schema.createTable(STUDENT_DROPOUT_TABLE, (table) => {
          table.text("student_id").notNullable().primary();
          table.float("prob_dropout", 4);
          table.text("weight_per_semester");
          table.boolean("active").defaultTo(false).notNullable();
          table.float("model_accuracy", 4);
          table.text("explanation");
        });
        await StudentDropoutTable().insert(
          (await import("./mockData/student_dropout.json")).default.map(
            ({ weight_per_semester, ...rest }) => {
              return {
                ...rest,
                weight_per_semester: weight_per_semester.toString(),
              };
            }
          )
        );
      }
    });

  const studentProgram = dbData.schema
    .hasTable(STUDENT_PROGRAM_TABLE)
    .then(async (exists) => {
      if (!exists) {
        await dbData.schema.createTable(STUDENT_PROGRAM_TABLE, (table) => {
          table.text("student_id").notNullable();
          table.text("program_id").notNullable();
          table.text("curriculum").notNullable();
          table.primary(["student_id", "program_id", "curriculum"]);
          table.integer("start_year", 4).notNullable();
          table.text("mention").notNullable();
          table.integer("last_term", 4).notNullable();
          table.integer("n_courses", 8).notNullable();
          table.integer("n_passed_courses", 8).notNullable();
          table.float("completion", 4).notNullable();
        });
        await StudentProgramTable().insert(
          (await import("./mockData/student_program.json")).default.map(
            ({ program_id, curriculum, ...rest }) => {
              return {
                ...rest,
                program_id: program_id.toString(),
                curriculum: curriculum.toString(),
              };
            }
          )
        );
      }
    });

  const studentTerm = dbData.schema
    .hasTable(STUDENT_TERM_TABLE)
    .then(async (exists) => {
      if (!exists) {
        await dbData.schema.createTable(STUDENT_TERM_TABLE, (table) => {
          table.integer("id", 8).primary().notNullable();
          table.text("student_id").notNullable();
          table.integer("year", 4).notNullable();
          table.integer("term", 4).notNullable();
          table.text("situation").notNullable();
          table.float("t_gpa", 8).notNullable();
          table.float("c_gpa", 8).notNullable();
          table.text("comments").notNullable().defaultTo("");
          table.text("program_id").notNullable();
          table.text("curriculum").notNullable();
          table.integer("start_year", 4).notNullable();
          table.text("mention").notNullable().defaultTo("");
        });
        await StudentTermTable().insert(
          (await import("./mockData/student_term.json")).default.map(
            ({ comments, program_id, curriculum, ...rest }) => {
              return {
                ...rest,
                comments: comments.toString(),
                program_id: program_id.toString(),
                curriculum: curriculum.toString(),
              };
            }
          )
        );
      }
    });

  const performanceByLoad = dbData.schema
    .hasTable(PERFORMANCE_BY_LOAD_TABLE)
    .then(async (exists) => {
      if (!exists) {
        await dbData.schema.createTable(PERFORMANCE_BY_LOAD_TABLE, (table) => {
          table.integer("id", 8).primary().notNullable();
          table.text("program_id").notNullable().defaultTo("");
          table.integer("student_cluster", 2).notNullable();
          table.text("courseload_unit").notNullable().defaultTo("credits");
          table.float("courseload_lb", 4).notNullable();
          table.float("courseload_ub", 4).notNullable();
          table.float("hp_value", 4).notNullable();
          table.float("mp_value", 4).notNullable();
          table.float("lp_value", 4).notNullable();
          table.text("message_title").notNullable();
          table.text("message_text").notNullable();
          table.text("cluster_label").notNullable();
          table.integer("hp_count");
          table.integer("mp_count");
          table.integer("lp_count");
          table.text("courseload_label").notNullable();
          table.integer("n_total");
        });

        await PerformanceByLoadTable().insert(
          (await import("./mockData/performance_by_load.json")).default
        );
      }
    });

  const studentcluster = dbData.schema
    .hasTable(STUDENT_CLUSTER_TABLE)
    .then(async (exists) => {
      if (!exists) {
        await dbData.schema.createTable(STUDENT_CLUSTER_TABLE, (table) => {
          table.text("student_id");
          table.text("program_id");
          table.integer("cluster", 2);

          table.primary(["student_id", "program_id"]);
        });

        await StudentClusterTable().insert(
          (await import("./mockData/student_program.json")).default.map(
            ({ student_id, program_id }, index) => {
              return {
                student_id,
                program_id: program_id.toString(),
                cluster: index % 3,
              };
            }
          )
        );
      }
    });

  const persistence = dbAuth.schema
    .hasTable(PERSISTENCE_TABLE)
    .then(async (exists) => {
      if (!exists) {
        await dbAuth.schema.createTable(PERSISTENCE_TABLE, (table) => {
          table.text("user").notNullable();
          table.text("key").notNullable();
          table.json("data").notNullable();
          table.timestamp("timestamp", { useTz: true }).notNullable();
          table.increments("id").primary();

          table.unique(["user", "key"]);
        });
      }
    });

  const mockFeedbackForms = [
    {
      id: 0,
      name: "Feedback1",
    },
    {
      id: 1,
      name: "Feedback2",
    },
  ];

  const feedbackForm = dbTracking.schema
    .hasTable(FEEDBACK_FORM_TABLE)
    .then(async (exists) => {
      if (!exists) {
        await dbTracking.schema.createTable(FEEDBACK_FORM_TABLE, (table) => {
          table.increments("id").primary();

          table.text("name").notNullable();

          table.integer("priority").notNullable().defaultTo(0);
        });

        await FeedbackFormTable().insert(mockFeedbackForms);
      }
    });

  const mockFeedbackOptions: FeedbackQuestionOption[] = [
    {
      text: "option 1",
      value: 1,
    },
    {
      text: "option 2",
      value: 2,
    },
    {
      text: "option 3",
      value: 3,
    },
  ];

  const mockFeedbackQuestions = [
    {
      id: 0,
      form_id: 0,
      question: "Question1",
      type: FeedbackQuestionType.OpenText,
      options: "",
    },
    {
      id: 1,
      form_id: 0,
      question: "Question2",
      type: FeedbackQuestionType.SingleAnswer,
      options: joinFeedbackQuestionOptions(mockFeedbackOptions),
    },
    {
      id: 2,
      form_id: 0,
      question: "Question3",
      type: FeedbackQuestionType.MultipleAnswer,
      options: joinFeedbackQuestionOptions(mockFeedbackOptions),
    },
    {
      id: 3,
      form_id: 1,
      question: "Question4",
      type: FeedbackQuestionType.OpenText,
      options: "",
    },
    {
      id: 4,
      form_id: 1,
      question: "Question5",
      type: FeedbackQuestionType.SingleAnswer,
      options: joinFeedbackQuestionOptions(mockFeedbackOptions),
    },
    {
      id: 5,
      form_id: 1,
      question: "Question6",
      type: FeedbackQuestionType.MultipleAnswer,
      options: joinFeedbackQuestionOptions(mockFeedbackOptions),
    },
  ];

  const feedbackFormQuestion = dbTracking.schema
    .hasTable(FEEDBACK_FORM_QUESTION_TABLE)
    .then(async (exists) => {
      if (!exists) {
        await dbTracking.schema.createTable(
          FEEDBACK_FORM_QUESTION_TABLE,
          (table) => {
            table.increments("id").primary();

            table.integer("form_id").notNullable();

            table.text("question").notNullable();

            table
              .enu("type", [
                FeedbackQuestionType.OpenText,
                FeedbackQuestionType.SingleAnswer,
                FeedbackQuestionType.MultipleAnswer,
              ] as FeedbackQuestionType[])
              .notNullable();

            table.integer("priority").notNullable().defaultTo(0);

            table.text("options").notNullable().defaultTo("");
          }
        );

        await FeedbackFormQuestionTable().insert(mockFeedbackQuestions);
      }
    });

  const feedbackResult = dbTracking.schema
    .hasTable(FEEDBACK_RESULT_TABLE)
    .then(async (exists) => {
      if (!exists) {
        await dbTracking.schema.createTable(FEEDBACK_RESULT_TABLE, (table) => {
          table.integer("form_id").notNullable();

          table.integer("question_id").notNullable();

          table.text("user_id").notNullable();

          table.text("answer").notNullable().defaultTo("");

          table
            .timestamp("timestamp", { useTz: true })
            .notNullable()
            .defaultTo(dbTracking.fn.now());

          table.primary(["form_id", "question_id", "user_id"]);
        });

        const form_id = sample(mockFeedbackForms)?.id ?? 0;

        const questionsOfForm = mockFeedbackQuestions.filter(
          (question) => question.form_id === form_id
        );

        await FeedbackResultTable().insert(
          questionsOfForm.map((question) => {
            return {
              form_id,
              question_id: question.id,
              user_id: "admin@admin.dev",
              answer:
                sample(
                  splitFeedbackQuestionOptions(question.options)
                )?.value.toString() ?? "random",
            };
          })
        );
      }
    });

  await Promise.all([
    users,
    usersPrograms,
    userConfig,
    config,
    track,
    course,
    courseStats,
    param,
    program,
    programStructure,
    student,
    studentCourse,
    studentDropout,
    studentProgram,
    studentTerm,
    performanceByLoad,
    studentcluster,
    persistence,
    feedbackForm,
    feedbackFormQuestion,
    feedbackResult,
  ]);

  await Promise.all([
    dbAuth.destroy(),
    dbConfig.destroy(),
    dbData.destroy(),
    dbTracking.destroy(),
  ]);

  console.info("DATABASE PREPARED!");
};

if (process.env.NODE_ENV === undefined) {
  //@ts-ignore
  process.env.NODE_ENV = "development";
}
if (process.env.NODE_ENV !== "test") {
  migration().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
