/*
 * Joris: edit these. Empty values are hidden on the page and answered as "not written yet".
 */
export interface Config {
  START: string;
  LENGTH: string;
  GRAD: string;
  CITIES: string;
  /** e.g. 'No fees for your company; I cover the sponsor fee' */
  FEE: string;
  RESUME_URL: string;
  /** this page's GitHub repo, once it's up */
  ARTIFACT_URL: string;
}

export const CONFIG: Config = {
  START: 'as soon as possible',
  LENGTH: '6–12 months',
  GRAD: '2031',
  CITIES: 'anywhere in the US',
  FEE: '',
  RESUME_URL:
    'https://drive.google.com/file/d/1TeZ4JxRDFt5Hxd4t5o86kFqtI_7zQ_lU/view?usp=drive_link',
  ARTIFACT_URL: '',
};

export const NOT_YET = 'not written yet';
export const EMAIL = 'geis.joris@gmail.com';

export function feeText(config: Config): string {
  return config.FEE ? config.FEE.replace(/\.$/, '') : NOT_YET + '; it varies by sponsor';
}
