import { CONFIG, NOT_YET, feeText, type Config } from './config';
import { stripPlaceholders } from '../lib/placeholders';

/** The files the answers come from. Open any of them with /cat. */
function rawFiles(c: Config) {
  return {
    'README.md':
      'Joris Geis, full-stack software engineer.\nZetel, Germany (CET). Enrolled in a B.S. in Information Systems at Hochschule Emden/Leer.\n2+ years building web apps with React, Next.js, TypeScript and Node.js in fully remote teams, including a 12-month full-time software engineering internship.\nBuilt a Duolingo-style streak system that cut churn 10% on a platform with 500+ users.\nLooking for: an on-site J-1 internship in the US, ' +
      c.LENGTH +
      '.',
    'availability.md':
      'Availability\n- Start: ' +
      (c.START || NOT_YET) +
      '. After an offer, the sponsor paperwork and visa appointment take several weeks.\n- Length: ' +
      c.LENGTH +
      ', full-time (at least 32 hours a week).\n- Where: on-site, ' +
      (c.CITIES || 'in the US') +
      '. He relocates for the internship.\n- Remote from Germany: not possible; a J-1 internship requires on-site supervision in the US.\n- Expected graduation: ' +
      (c.GRAD || NOT_YET) +
      '.',
    'experience/arztkonsultation.md':
      'Full-Stack Developer (working student, part-time)\narztkonsultation ak GmbH · remote, Germany\nSep 2026 – present\n- Frontend and backend features for a certified, end-to-end encrypted telehealth video platform used by medical practices, outpatient care centers and hospitals.\n- Works across the stack with the engineering team in a privacy-critical, regulated healthcare domain.',
    'experience/nova-digital.md':
      'Full-Stack Developer (working student, part-time)\nNova Digital Group GmbH · remote, Bremen\nMar 2026 – Sep 2026\n- Service agency: built websites and web applications for clients such as Cordes & Graefe, across frontend and backend.',
    'experience/groupera.md':
      'Software Engineering Intern, Full-Stack (full-time, 12 months)\nGroupera · remote, Berlin\nNov 2024 – Nov 2025\n- Groupera is an online self-help platform with group meetings and psychiatrists.\n- Designed and built its streak-based gamification system (Duolingo as the reference), which cut user churn by 10%.\n- Platform serving 500+ users, built with Next.js, TypeScript and Tailwind CSS.\n- Node.js backend features, REST APIs, data models with MongoDB/Mongoose; Docker and Git-based workflows.\n- Agile team, regular code reviews, close alignment with senior engineers.',
    'experience/buildnext.md':
      'Frontend Developer (part-time, during high school)\nbuildnext GmbH · remote, Oldenburg\nJan 2023 – Oct 2023\n- Service agency: responsive client websites and interactive components with React, Next.js and Tailwind CSS.\n- Turned client requirements into frontend features and picked up new frameworks quickly.',
    'education.md':
      'B.S. Information Systems (Wirtschaftsinformatik)\nHochschule Emden/Leer, enrolled since Mar 2026. Focus: software engineering, data-driven business models.\nExpected graduation: ' +
      (c.GRAD || NOT_YET) +
      '.\n\nUniversity entrance qualification (Fachhochschulreife), Nov 2025\nLothar-Meyer-Gymnasium, Varel. Coursework plus the 12-month Groupera internship.',
    'stack.json':
      '{\n  "React, Next.js, Tailwind CSS": "buildnext (2023), Nova Digital (2026), Groupera (2024–25)",\n  "TypeScript": "Groupera (2024–25)",\n  "Node.js, REST APIs, MongoDB, Mongoose": "Groupera backend (2024–25)",\n  "Docker, Git workflows, code reviews": "Groupera (2024–25)",\n  "OpenAI / LLM APIs, prompt engineering": "an earlier, LLM-powered version of this portfolio (2026)",\n  "also": ["JavaScript (ES6+)", "HTML5", "CSS3", "Responsive design", "UI/UX design", "Agile/Scrum", "Remote collaboration"],\n  "spoken": ["English (fluent)", "German (native)"]\n}',
    'projects/streak-system.md':
      'Streak system · Groupera · 2024–25\nContext: Groupera is an online self-help platform with group meetings and psychiatrists. The brief was to add gamification, using Duolingo as the reference.\nHow it works:\n- Join at least one meeting a week to keep your streak going.\n- Miss a week and the streak is lost.\n- Reach a 4-week streak and earn freeze tokens; a token keeps the streak alive through a week you miss entirely.\n- Reminder emails encourage people to keep their streak going.\nResult: churn down 10% on a platform with 500+ users.\nStack: Next.js, TypeScript, Tailwind CSS, Node.js, MongoDB/Mongoose.\nHow the 10% was measured: [BASELINE, PERIOD, WHO WAS COUNTED]\nWhat I would do differently: [ONE HONEST LESSON]',
    'projects/this-portfolio.md':
      'This portfolio · 2026\nProblem: reviewers skim a portfolio in seconds, and a static page only answers the questions its author predicted.\nApproach: the key facts sit in a summary card that needs no typing. Below it, a command line answers follow-up questions by matching keywords to answers Joris wrote, each tied to a file you can open with /cat.\nKey decision: an earlier version used an LLM agent with tool calling. Joris replaced it with written answers, so the page runs anywhere, costs nothing, and nothing a visitor types leaves the browser.\nStack: plain HTML, CSS and JavaScript. No framework, no backend.',
    'visa.md':
      'J-1 Intern visa: what hosting involves\n- Eligibility: Joris is enrolled at a university outside the US, which the J-1 Intern category requires.\n- A State Department-designated sponsor issues the visa documents. The company is the HOST, not the visa sponsor. No H-1B petition, no lottery.\n- The host makes an offer and co-signs a training plan (Form DS-7002) with the sponsor. Joris drafts it.\n- Joris works on-site with a supervisor, full-time (at least 32 hours a week), ' +
      c.LENGTH +
      '.\n- Programs longer than 6 months include a midpoint and a final evaluation.\n- The sponsor checks the host’s EIN and workers’ compensation coverage, and visits hosts that are new to it and have fewer than 25 employees or under $3M in annual revenue.\n- Sponsor fee: ' +
      feeText(c) +
      '.\n- Pay and other terms: not in these files; email Joris.\n- Rules: 22 CFR 62.22 (US State Department).',
    'why-usa.md':
      'Joris and a friend spent three and a half weeks in Austin, Texas, and it made him want to see how American teams build software day to day, not as a visitor.\nHe wants one year working on a US product team, then to bring that back to Germany and finish his degree.',
    'contact.md':
      'email     geis.joris@gmail.com\nlinkedin  linkedin.com/in/jorisgeis\ngithub    github.com/jorisgeis\nphone     +49 151 41249159\ntime zone CET (usually 7 hours ahead of Austin)',
  };
}

export type Files = ReturnType<typeof rawFiles>;
export type FilePath = keyof Files;

export function buildFiles(config: Config): Files {
  const raw = rawFiles(config);
  return Object.fromEntries(
    Object.entries(raw).map(([path, text]) => [path, stripPlaceholders(text)]),
  ) as Files;
}

export const FILES = buildFiles(CONFIG);
export const PATHS = Object.keys(FILES) as FilePath[];

export function lineCount(path: FilePath): number {
  return FILES[path].split('\n').length;
}
