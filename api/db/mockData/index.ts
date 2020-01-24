import sha1 from "crypto-js/sha1";
import { chunk } from "lodash";

import { dbAuth, dbConfig, dbData, dbTracking } from "../";
import { UserType } from "../../../constants";
import { baseConfig } from "../../../constants/baseConfig";
import { baseUserConfig } from "../../../constants/userConfig";
import { configValueToString } from "../../../constants/validation";
import {
  CONFIGURATION_TABLE,
  ConfigurationTable,
  COURSE_STATS_TABLE,
  COURSE_TABLE,
  CourseStatsTable,
  CourseTable,
  PARAMETER_TABLE,
  ParameterTable,
  PROGRAM_STRUCTURE_TABLE,
  PROGRAM_TABLE,
  ProgramStructureTable,
  ProgramTable,
  STUDENT_COURSE_TABLE,
  STUDENT_DROPOUT_TABLE,
  STUDENT_PROGRAM_TABLE,
  STUDENT_TABLE,
  STUDENT_TERM_TABLE,
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
} from "../tables";

const dataImport = async () => {
  dbAuth.schema.hasTable(USERS_TABLE).then(async exists => {
    if (!exists) {
      await dbAuth.schema.createTable(USERS_TABLE, table => {
        table.text("email").primary();
        table
          .text("password")
          .notNullable()
          .defaultTo("");
        table
          .text("name")
          .notNullable()
          .defaultTo("Default");
        table
          .text("oldPassword1")
          .notNullable()
          .defaultTo("");
        table
          .text("oldPassword2")
          .notNullable()
          .defaultTo("");
        table
          .text("oldPassword3")
          .notNullable()
          .defaultTo("");
        table
          .boolean("locked")
          .notNullable()
          .defaultTo(true);
        table
          .integer("tries")
          .notNullable()
          .defaultTo(0);
        table
          .text("unlockKey")
          .notNullable()
          .defaultTo("");
        table
          .boolean("admin")
          .notNullable()
          .defaultTo(false);
        table
          .enum("type", Object.values(UserType))
          .notNullable()
          .defaultTo(UserType.Director);
        table
          .text("student_id")
          .notNullable()
          .defaultTo("");
      });

      await UserTable().insert({
        email: "admin@admin.dev",
        password: sha1("admin").toString(),
        name: "default admin",
        locked: false,
        admin: true,
        type: UserType.Director,
        student_id: (await import("./student.json")).default[0].id,
      });
    }
  });

  dbAuth.schema.hasTable(USER_PROGRAMS_TABLE).then(async exists => {
    if (!exists) {
      await dbAuth.schema.createTable(USER_PROGRAMS_TABLE, table => {
        table.text("email");
        table.text("program");
        table.primary(["email", "program"]);
      });
      await UserProgramsTable().insert(
        (await import("./program.json")).default.map(({ id }) => {
          return {
            email: "admin@admin.dev",
            program: id.toString(),
          };
        })
      );
    }
  });

  dbConfig.schema.hasTable(USER_CONFIGURATION_TABLE).then(async exists => {
    if (!exists) {
      await dbConfig.schema.createTable(USER_CONFIGURATION_TABLE, table => {
        table
          .text("email")
          .primary()
          .notNullable();
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

  dbConfig.schema.hasTable(CONFIGURATION_TABLE).then(async exists => {
    if (!exists) {
      await dbConfig.schema.createTable(CONFIGURATION_TABLE, table => {
        table
          .text("name")
          .primary()
          .defaultTo("");
        table
          .text("value")
          .defaultTo("")
          .notNullable();
      });

      await ConfigurationTable().insert(
        Object.entries(baseConfig).map(([name, valueRaw]) => {
          return {
            name,
            value: configValueToString(valueRaw),
          };
        })
      );
    }
  });

  dbTracking.schema.hasTable(TRACKING_TABLE).then(async exists => {
    if (!exists) {
      await dbTracking.schema.createTable(TRACKING_TABLE, table => {
        table
          .bigIncrements("id")
          .primary()
          .unsigned();
        table
          .text("app_id")
          .notNullable()
          .defaultTo("undefined");
        table.text("user_id").notNullable();
        table.timestamp("datetime", { useTz: true }).notNullable();
        table.timestamp("datetime_client", { useTz: true }).notNullable();
        table.text("data").notNullable();
      });
    }
  });

  dbData.schema.hasTable(COURSE_TABLE).then(async exists => {
    if (!exists) {
      await dbData.schema.createTable(COURSE_TABLE, table => {
        table
          .text("id")
          .notNullable()
          .primary();
        table.text("name").notNullable();
        table.text("description").notNullable();
        table
          .text("tags")
          .notNullable()
          .defaultTo("");
        table.text("grading").notNullable();
        table.float("grade_min", 4).notNullable();
        table.float("grade_max", 4).notNullable();
        table.float("grade_pass_min", 4).notNullable();
      });

      await CourseTable().insert((await import("./course.json")).default);
    }
  });

  dbData.schema.hasTable(COURSE_STATS_TABLE).then(async exists => {
    if (!exists) {
      await dbData.schema.createTable(COURSE_STATS_TABLE, table => {
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
        table
          .integer("id", 8)
          .primary()
          .notNullable();
        table.text("histogram_labels").notNullable();
        table.text("color_bands").notNullable();
      });

      const dataToInsert = chunk(
        (await import("./course_stats.json")).default,
        500
      );

      for (const chunkData of dataToInsert) {
        await CourseStatsTable().insert(chunkData);
      }
    }
  });

  dbData.schema.hasTable(PARAMETER_TABLE).then(async exists => {
    if (!exists) {
      await dbData.schema.createTable(PARAMETER_TABLE, table => {
        table.float("passing_grade", 8);
        table.timestamp("loading_date");
      });
      await ParameterTable().insert(
        (await import("./parameter.json")).default.map(
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

  dbData.schema.hasTable(PROGRAM_TABLE).then(async exists => {
    if (!exists) {
      await dbData.schema.createTable(PROGRAM_TABLE, table => {
        table
          .text("id")
          .notNullable()
          .primary();
        table.text("name").notNullable();
        table.text("desc").notNullable();
        table.text("tags").notNullable();
        table
          .boolean("active")
          .notNullable()
          .defaultTo(true);
        table
          .float("last_gpa", 4)
          .notNullable()
          .defaultTo(0);
      });
      await ProgramTable().insert(
        (await import("./program.json")).default.map(({ id, ...rest }) => {
          return {
            ...rest,
            id: id.toString(),
          };
        })
      );
    }
  });

  dbData.schema.hasTable(PROGRAM_STRUCTURE_TABLE).then(async exists => {
    if (!exists) {
      await dbData.schema.createTable(PROGRAM_STRUCTURE_TABLE, table => {
        table
          .integer("id", 8)
          .notNullable()
          .primary();
        table.text("program_id").notNullable();
        table.text("curriculum").notNullable();
        table.integer("semester", 4).notNullable();
        table.text("course_id").notNullable();
        table.float("credits", 8).notNullable();
        table
          .text("requisites")
          .defaultTo("")
          .notNullable();
        table
          .text("mention")
          .defaultTo("")
          .notNullable();
        table
          .text("course_cat")
          .defaultTo("")
          .notNullable();
        table
          .text("mode")
          .defaultTo("semestral")
          .notNullable();
        table.float("credits_sct", 8).notNullable();
        table
          .text("tags")
          .notNullable()
          .defaultTo("");
      });
      await ProgramStructureTable().insert(
        (await import("./program_structure.json")).default.map(
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

  dbData.schema.hasTable(STUDENT_TABLE).then(async exists => {
    if (!exists) {
      await dbData.schema.createTable(STUDENT_TABLE, table => {
        table
          .text("id")
          .notNullable()
          .primary();
        table.text("name").notNullable();
        table.text("state").notNullable();
      });
      await StudentTable().insert((await import("./student.json")).default);
    }
  });

  dbData.schema.hasTable(STUDENT_COURSE_TABLE).then(async exists => {
    if (!exists) {
      await dbData.schema.createTable(STUDENT_COURSE_TABLE, table => {
        table
          .integer("id", 8)
          .notNullable()
          .primary();
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
        (await import("./student_course.json")).default
      );
    }
  });

  dbData.schema.hasTable(STUDENT_DROPOUT_TABLE).then(async exists => {
    if (!exists) {
      await dbData.schema.createTable(STUDENT_DROPOUT_TABLE, table => {
        table
          .text("student_id")
          .notNullable()
          .primary();
        table.float("prob_dropout", 4);
        table.text("weight_per_semester");
        table
          .boolean("active")
          .defaultTo(false)
          .notNullable();
        table.float("model_accuracy", 4);
      });
      await StudentDropoutTable().insert(
        (await import("./student_dropout.json")).default.map(
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

  dbData.schema.hasTable(STUDENT_PROGRAM_TABLE).then(async exists => {
    if (!exists) {
      await dbData.schema.createTable(STUDENT_PROGRAM_TABLE, table => {
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
        (await import("./student_program.json")).default.map(
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

  dbData.schema.hasTable(STUDENT_TERM_TABLE).then(async exists => {
    if (!exists) {
      await dbData.schema.createTable(STUDENT_TERM_TABLE, table => {
        table
          .integer("id", 8)
          .primary()
          .notNullable();
        table.text("student_id").notNullable();
        table.integer("year", 4).notNullable();
        table.integer("term", 4).notNullable();
        table.text("situation").notNullable();
        table.float("t_gpa", 8).notNullable();
        table.float("c_gpa", 8).notNullable();
        table
          .text("comments")
          .notNullable()
          .defaultTo("");
        table.text("program_id").notNullable();
        table.text("curriculum").notNullable();
        table.integer("start_year", 4).notNullable();
        table
          .text("mention")
          .notNullable()
          .defaultTo("");
      });
      await StudentTermTable().insert(
        (await import("./student_term.json")).default.map(
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
};

if (process.env.NODE_ENV !== "test") {
  dataImport();
}
