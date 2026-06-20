// Navigation links rendered in the sidebar and passed through the layout.
export interface NavLink {
  href: string;
  title: string;
  icon: string;
}

// A social/professional website entry (src/data/websites.json).
export interface Website {
  name: string;
  icon: string;
  url: string;
  username: string;
}

// schema.org JSON-LD metadata. Assembled ad-hoc per page with varying shapes, so it is intentionally loose.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StructuredData = Record<string, any>;

// CV data (src/data/about/cv.yaml), following https://jsonresume.org.
export interface CvLocation {
  city: string;
  countryCode: string;
}

export interface CvBasics {
  name: string;
  label: string;
  summary: string;
  website: string;
  url: string;
  location: CvLocation;
}

export interface CvWork {
  name: string;
  url?: string;
  location: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  highlights: string[];
}

export interface CvCertificate {
  name: string;
  issuer: string;
  url: string;
  date?: Date;
}

export interface CvEducation {
  institution: string;
  url?: string;
  location: string;
  area?: string;
  studyType: string;
  diploma?: string;
  startDate: Date;
  endDate: Date;
}

export interface CvSkill {
  name: string;
  level?: string;
  keywords: string[];
}

export interface CvInterest {
  name: string;
  keywords: string[];
}

export interface CvLanguage {
  language: string;
  code: string;
  fluency: string;
}

export interface Cv {
  basics: CvBasics;
  work: CvWork[];
  certificates: CvCertificate[];
  education: CvEducation[];
  skills: CvSkill[];
  interests: CvInterest[];
  languages: CvLanguage[];
}
