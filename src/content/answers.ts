import { CONFIG, EMAIL, NOT_YET, feeText, type Config } from './config';
import type { FilePath } from './files';

export type Topic =
  | 'off_topic'
  | 'judgment'
  | 'pay'
  | 'personal'
  | 'beyond_j1'
  | 'measurement'
  | 'availability'
  | 'hosting'
  | 'visa'
  | 'this_portfolio'
  | 'nova'
  | 'buildnext'
  | 'ai'
  | 'streak'
  | 'current'
  | 'grades'
  | 'unlisted_skill'
  | 'location'
  | 'why_us'
  | 'resume'
  | 'contact'
  | 'stack'
  | 'experience'
  | 'education'
  | 'languages'
  | 'about'
  | 'fallback_unmatched';

export interface AnswerRule {
  pattern: RegExp;
  /** Files "read" before the answer, shown as tool lines. */
  files: FilePath[];
  answer: string;
  topic: Topic;
}

type Row = [RegExp, FilePath[], string, Topic];

/** Order matters: specific questions first, broad keywords last, catch-all last. */
export function buildAnswers(c: Config): AnswerRule[] {
  const cities = c.CITIES || 'in the US';
  const startLine =
    (c.START ? 'He can start ' + c.START : 'He hasn’t written his start date yet') +
    ', for ' +
    c.LENGTH +
    ', full-time and on-site, ' +
    cities +
    '. After an offer, the sponsor paperwork and visa appointment take several weeks.';

  const rows: Row[] = [
    [
      /\b(ignore (all |any |your |previous |prior )?(instructions|rules|prompt)|poem|joke|song|recipe|pretend)\b/i,
      [],
      'I only answer questions about Joris and his work. Type /help to see what I can answer.',
      'off_topic',
    ],
    [
      /\b(should (we|i) hire|rate (him|joris)|score (him|joris)|better than|worth hiring|good fit|recommend (him|joris))\b/i,
      ['README.md'],
      'That’s your call, so I won’t rate him. The facts: 2+ years of React, TypeScript and Node in remote teams, a 12-month full-time internship where his streak system cut churn 10%, and current work on an encrypted telehealth platform. Email him at ' +
        EMAIL +
        ' to talk.',
      'judgment',
    ],
    [
      /\b(salary|salaries|pay|paid|compensation|stipend|wages?|hourly|how much (does|would|will) he)\b/i,
      [],
      'Pay isn’t in Joris’s files, and I won’t guess a number. Email him at ' + EMAIL + '.',
      'pay',
    ],
    [/\b(age|how old|born|birthday|birth date)\b/i, [], 'That isn’t in Joris’s files.', 'personal'],
    [
      /\b(h-?1b|green ?card|stay (in|after)|after (the|his) internship|long[- ]term|permanent\w*|immigrat\w*)\b/i,
      ['visa.md'],
      'His files only cover a J-1 internship of ' +
        c.LENGTH +
        '. For anything beyond that, email him at ' +
        EMAIL +
        '.',
      'beyond_j1',
    ],
    [
      /\b(measur\w*|baseline|methodolog\w*|statistic\w*|significan\w*)\b/i,
      ['projects/streak-system.md'],
      'How the 10% was measured isn’t written up yet. Email Joris at ' +
        EMAIL +
        ' for the details.',
      'measurement',
    ],
    [
      /\b(start|available|availability|when|remote\w*|on-?site|relocat\w*|move|cities|city|how long|duration|length)\b/i,
      ['availability.md'],
      startLine +
        ' Remote from Germany isn’t possible: a J-1 internship requires on-site supervision.',
      'availability',
    ],
    [
      /\b(fees?|costs?|paperwork|training plan|host\w*|hiring|evaluations?|ds-?\d+|involve\w*|obligations?)\b/i,
      ['visa.md'],
      'Your company hosts; a State Department-designated sponsor handles the visa. You make an offer and co-sign a training plan with the sponsor, which Joris drafts. He works on-site with a supervisor, with a midpoint and a final evaluation. The sponsor checks your EIN and workers’ compensation and may visit if you’re small. Sponsor fee: ' +
        feeText(c) +
        '.',
      'hosting',
    ],
    [
      /\b(visa|j-?1|sponsor\w*|citizen\w*|authori[sz]\w*|work permit|status)\b/i,
      ['visa.md'],
      'He’d come on a J-1 Intern visa. A State Department-designated sponsor issues the documents, so your company hosts rather than sponsors: an offer plus a co-signed training plan. No H-1B petition, no lottery.',
      'visa',
    ],
    [
      /\b(this (site|page|portfolio)|how (does|did|was) (this|it)|built this|this (agent|terminal)|the (agent|terminal)|chatbot|bot)\b/i,
      ['projects/this-portfolio.md'],
      'This page is one of his projects: a summary card plus a command line. Your question is matched to answers Joris wrote, each tied to a file you can open with /cat. He first built it with an LLM agent, then replaced that with written answers so it runs anywhere and nothing you type leaves your browser.',
      'this_portfolio',
    ],
    [
      /\bnova\b/i,
      ['experience/nova-digital.md'],
      'At Nova Digital Group, a service agency (Mar–Sep 2026, working student, remote), he built websites and web applications for clients such as Cordes & Graefe.',
      'nova',
    ],
    [
      /\bbuildnext\b/i,
      ['experience/buildnext.md'],
      'At buildnext, also a service agency (Jan–Oct 2023, part-time during high school), he built responsive client websites and interactive components with React, Next.js and Tailwind CSS.',
      'buildnext',
    ],
    [
      /\b(ai|llms?|gpt|openai|prompt\w*|agents?|machine learning|artificial intelligence)\b/i,
      ['stack.json', 'projects/this-portfolio.md'],
      'He loves AI and is happy to be living through this fundamental change; he sees it as an opportunity. He integrates OpenAI and other LLM APIs and does prompt engineering. The first version of this page ran a tool-calling LLM agent over these files.',
      'ai',
    ],
    [
      /\b(churn|streak\w*|impact|results?|groupera|gamif\w*|projects?|case stud\w*|duolingo)\b/i,
      ['experience/groupera.md', 'projects/streak-system.md'],
      'At Groupera, an online self-help platform with group meetings and psychiatrists, he built a Duolingo-style streak system during a 12-month full-time internship. One meeting a week keeps the streak; miss a week and it’s lost; a 4-week streak earns freeze tokens that cover a missed week; reminder emails keep people going. Churn fell 10% on a platform with 500+ users.',
      'streak',
    ],
    [
      /\b(telehealth|health\w*|encrypt\w*|arzt\w*|current\w*|now|today)\b/i,
      ['experience/arztkonsultation.md'],
      'Since September 2026 he’s a working student (part-time) at arztkonsultation, building frontend and backend features for a certified, end-to-end encrypted video consultation platform used by medical practices, outpatient centers and hospitals.',
      'current',
    ],
    [
      /\b(grades?|gpa|transcript)\b/i,
      ['education.md'],
      'Grades aren’t in Joris’s files. Email him at ' + EMAIL + ' for a transcript.',
      'grades',
    ],
    [
      /\b(python|java|golang|rust|php|sql|postgres\w*|mysql|aws|azure|gcp|kubernetes|vue|angular|svelte|django|testing|tests|jest|playwright|ci)\b/i,
      ['stack.json'],
      'That isn’t in Joris’s files, so I won’t claim it. What he does list: React, Next.js, TypeScript, Tailwind, Node.js, REST APIs, MongoDB/Mongoose, Docker and LLM APIs. Email him to ask.',
      'unlisted_skill',
    ],
    [
      /\b(based|location|located|lives?|time ?zone|cet|where)\b/i,
      ['contact.md'],
      'He lives in Zetel, Germany (CET), usually 7 hours ahead of Austin, and relocates for the internship, ' +
        cities +
        '.',
      'location',
    ],
    [
      /\b(why|austin|texas|america|usa|abroad)\b/i,
      ['why-usa.md'],
      'Three and a half weeks in Austin with a friend made him want to see how American teams build software day to day. He wants one year on a US product team, then to finish his degree in Germany.',
      'why_us',
    ],
    [
      /\b(resume|résumé|cv)\b/i,
      [],
      c.RESUME_URL
        ? 'Résumé: ' + c.RESUME_URL
        : 'The résumé isn’t linked yet. Email ' + EMAIL + '.',
      'resume',
    ],
    [
      /\b(contact|email|e-mail|mail|reach|phone|linkedin|github)\b/i,
      ['contact.md'],
      'Email is fastest: ' +
        EMAIL +
        '. He’s also at linkedin.com/in/jorisgeis and github.com/jorisgeis, on CET, usually 7 hours ahead of Austin.',
      'contact',
    ],
    [
      /\b(stack|tech\w*|skills?|react|next\w*|typescript|node\w*|tools?|frameworks?)\b/i,
      ['stack.json'],
      'React, Next.js, TypeScript and Tailwind on the frontend; Node.js, REST APIs, MongoDB, Mongoose and Docker on the backend; plus OpenAI and LLM API integration and prompt engineering.',
      'stack',
    ],
    [
      /\b(experience|years|work\w*|jobs?|career|compan\w*|intern\w*|roles?)\b/i,
      ['experience/groupera.md'],
      'Four remote roles: arztkonsultation (encrypted telehealth, since Sep 2026), Nova Digital Group (agency, client websites, Mar–Sep 2026), a 12-month full-time software engineering internship at Groupera (self-help platform, 2024–25), and buildnext (agency, 2023, during high school). That’s 2+ years in total.',
      'experience',
    ],
    [
      /\b(study|studies|studying|student|education|universit\w*|degree|school|enrolled|graduat\w*)\b/i,
      ['education.md'],
      'He’s enrolled in a B.S. in Information Systems at Hochschule Emden/Leer (since March 2026), focused on software engineering and data-driven business models. Expected graduation: ' +
        (c.GRAD || NOT_YET) +
        '.',
      'education',
    ],
    [
      /\b(speak|spoken|english|german|languages?)\b/i,
      ['stack.json'],
      'English fluent, German native.',
      'languages',
    ],
    [
      /\b(looking for|wants?|goals?|seeking|who is|about (him|joris)|overview|summary|introduce)\b/i,
      ['README.md'],
      'Joris is a full-stack engineer from Germany with 2+ years in remote teams, including a 12-month full-time internship. He’s looking for an on-site J-1 internship in the US, ' +
        c.LENGTH +
        ', starting ' +
        (c.START || 'soon') +
        '.',
      'about',
    ],
    [
      /./,
      [],
      'That isn’t in Joris’s files, so I won’t guess. Email him at ' +
        EMAIL +
        ', or type /help to see what I can answer.',
      'fallback_unmatched',
    ],
  ];

  return rows.map(([pattern, files, answer, topic]) => ({ pattern, files, answer, topic }));
}

export const ANSWERS = buildAnswers(CONFIG);
