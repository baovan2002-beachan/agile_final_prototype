export const LEVELS = ["P1", "P2", "P3", "P4", "P5", "P6", "Sec 1", "Sec 2", "Sec 3", "Sec 4"] as const;
export type Level = (typeof LEVELS)[number];
export const STATUSES = ["Active", "On leave", "Transferred"] as const;
export type StudentStatus = (typeof STATUSES)[number];
export type SbfasStatus = "Approved" | "Pending" | "Rejected" | "Not applied";

export type Student = {
  id: string;
  name: string;
  level: Level;
  class: string;
  status: StudentStatus;
  /** Education Account balance in SGD. */
  balance: number;
  sbfas: SbfasStatus;
};

/** Classes offered by this (mock) school, two per level. */
export const CLASSES: Record<Level, [string, string]> = {
  P1: ["P1 Courage", "P1 Harmony"],
  P2: ["P2 Integrity", "P2 Respect"],
  P3: ["P3 Care", "P3 Resilience"],
  P4: ["P4 Courage", "P4 Harmony"],
  P5: ["P5 Integrity", "P5 Respect"],
  P6: ["P6 Care", "P6 Resilience"],
  "Sec 1": ["Sec 1 Aspire", "Sec 1 Bright"],
  "Sec 2": ["Sec 2 Aspire", "Sec 2 Bright"],
  "Sec 3": ["Sec 3 Aspire", "Sec 3 Bright"],
  "Sec 4": ["Sec 4 Aspire", "Sec 4 Bright"],
};

// [name, level, class index (0|1), status, balance, sbfas]
type Row = [string, Level, 0 | 1, StudentStatus, number, SbfasStatus];
const ROWS: Row[] = [
  ["Tan Wei Jie", "P1", 0, "Active", 214.35, "Not applied"],
  ["Nur Aisyah binte Rahman", "P1", 1, "Active", 187.9, "Approved"],
  ["Lim Xin Yi", "P1", 1, "Active", 242.6, "Not applied"],
  ["Arjun s/o Krishnan", "P2", 0, "Active", 538.15, "Pending"],
  ["Chua Jia Hui", "P2", 1, "Active", 612.4, "Not applied"],
  ["Muhammad Irfan bin Hakim", "P2", 1, "On leave", 497.85, "Approved"],
  ["Meera d/o Ramasamy", "P2", 0, "Active", 574.5, "Pending"],
  ["Ong Zi Han", "P3", 0, "Active", 1043.2, "Not applied"],
  ["Priya d/o Subramaniam", "P3", 0, "Active", 986.75, "Approved"],
  ["Ethan Teo Kai Ming", "P3", 1, "Active", 1127.05, "Not applied"],
  ["Siti Nurhaliza binte Osman", "P3", 1, "Active", 902.3, "Pending"],
  ["Goh Yu Xuan", "P4", 0, "Active", 1568.9, "Not applied"],
  ["Rohan s/o Pillai", "P4", 0, "Active", 1493.45, "Rejected"],
  ["Chloe Wong Shu Ting", "P4", 1, "Transferred", 1604.1, "Not applied"],
  ["Haziq bin Abdullah", "P4", 1, "Active", 1431.6, "Approved"],
  ["Sim Hui Min", "P5", 0, "Active", 2036.55, "Not applied"],
  ["Daniel Koh Jun Wei", "P5", 0, "Active", 1978.2, "Not applied"],
  ["Kavitha d/o Raman", "P5", 1, "Active", 2112.8, "Approved"],
  ["Aqil Zafran bin Salleh", "P5", 1, "On leave", 1895.35, "Pending"],
  ["Yeo Rui En", "P6", 0, "Active", 2587.9, "Not applied"],
  ["Isabelle Ng Pei Shan", "P6", 0, "Active", 2641.15, "Not applied"],
  ["Vikram s/o Chandran", "P6", 1, "Active", 2503.7, "Approved"],
  ["Nurul Huda binte Ismail", "P6", 1, "Active", 2469.25, "Approved"],
  ["Lee Zhi Hao", "P6", 1, "Transferred", 2552.0, "Not applied"],
  ["Tay Jing Wen", "Sec 1", 0, "Active", 3014.6, "Not applied"],
  ["Mohamed Danish bin Yusof", "Sec 1", 0, "Active", 2947.85, "Pending"],
  ["Shreya d/o Nair", "Sec 1", 1, "Active", 3086.3, "Not applied"],
  ["Jonathan Lau Kai Xiang", "Sec 1", 1, "Active", 2993.4, "Approved"],
  ["Foo Mei Ling", "Sec 2", 0, "Active", 3512.75, "Not applied"],
  ["Adrian Pereira", "Sec 2", 0, "Active", 3468.1, "Not applied"],
  ["Nadia binte Jamal", "Sec 2", 1, "On leave", 3395.9, "Approved"],
  ["Kwok Yong Sheng", "Sec 2", 1, "Active", 3541.25, "Rejected"],
  ["Rachel Chia Wen Hui", "Sec 3", 0, "Active", 3987.45, "Not applied"],
  ["Imran Shah bin Zulkifli", "Sec 3", 0, "Active", 3921.0, "Approved"],
  ["Deepa d/o Govindasamy", "Sec 3", 1, "Active", 4058.7, "Pending"],
  ["Marcus Heng Zhe Yu", "Sec 3", 1, "Active", 3874.15, "Not applied"],
  ["Ang Li Ying", "Sec 4", 0, "Active", 4436.85, "Not applied"],
  ["Farhan bin Ahmad", "Sec 4", 0, "Active", 4379.3, "Approved"],
  ["Bernice Seah Xin Rong", "Sec 4", 1, "Active", 4502.6, "Not applied"],
  ["Joel Soh Wen Jie", "Sec 4", 1, "Transferred", 4418.95, "Not applied"],
];

export const STUDENTS: Student[] = ROWS.map(([name, level, c, status, balance, sbfas], i) => ({
  id: `S2026${String(i + 1).padStart(4, "0")}`,
  name,
  level,
  class: CLASSES[level][c],
  status,
  balance,
  sbfas,
}));
