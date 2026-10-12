// ASSUMPTION: invented schools, codes and enrolment counts (mock data).
export type School = { code: string; name: string; level: "Primary" | "Secondary" | "Junior College"; students: number };

export const SCHOOLS: School[] = [
  { code: "S001", name: "Greenfield Secondary School", level: "Secondary", students: 1120 },
  { code: "S002", name: "Riverbank Primary School", level: "Primary", students: 1480 },
  { code: "S003", name: "Maple Grove Primary School", level: "Primary", students: 1325 },
  { code: "S004", name: "Eastlake Secondary School", level: "Secondary", students: 1210 },
  { code: "S005", name: "Hillcrest Junior College", level: "Junior College", students: 940 },
  { code: "S006", name: "Sunrise Primary School", level: "Primary", students: 1560 },
  { code: "S007", name: "Northpoint Secondary School", level: "Secondary", students: 1075 },
  { code: "S008", name: "Westbrook Primary School", level: "Primary", students: 1390 },
  { code: "S009", name: "Lakeshore Secondary School", level: "Secondary", students: 1260 },
  { code: "S010", name: "Bayview Junior College", level: "Junior College", students: 880 },
  { code: "S011", name: "Oakwood Primary School", level: "Primary", students: 1215 },
  { code: "S012", name: "Southgate Secondary School", level: "Secondary", students: 1140 },
];
