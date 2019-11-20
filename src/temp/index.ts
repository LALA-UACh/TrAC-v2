export const rangeGrades = [
  {
    min: 1,
    max: 3.4,
    color: "#d6604d",
  },
  {
    min: 3.5,
    max: 3.9,
    color: "#f48873",
  },
  {
    min: 4,
    max: 4.4,
    color: "#a7dc78",
  },
  {
    min: 4.5,
    max: 7,
    color: "#66b43e",
  },
];
export const approvedGrade: number = 4;

export const minGrade = Math.min(...rangeGrades.map(({ min }) => min));
export const maxGrade = Math.max(...rangeGrades.map(({ max }) => max));

export const PSP_COLOR = "rgb(70,130,180)";
export const PGA_COLOR = "rgb(173,66,244)";
export const PROGRAM_PGA_COLOR = "rgb(102,102,102)";
