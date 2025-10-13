import 'dotenv/config';
import { supabase } from '../utils/supabase.js';

const newJob = {
  "application_url": "https://job-boards.greenhouse.io/discord/jobs/7854326002",
  "job_title": "Staff Software Engineer – UI/UX Specialist",
  "company": "Discord",
  "location": "our beautiful SF office",
  "job_id": "7854326002",
  "ats_type": "fixed_greenhouse",
  "scraped_at": "2025-10-03T08:15:00.997411",
  "source_url": "https://job-boards.greenhouse.io/discord",
  "department": "",
  "employment_type": "Full-time",
  "date_posted": "2025-10-03T08:14:59.744900",
  "description": "Discord is used by over 200 million people every month for many different reasons, but there's one thing that nearly everyone does on our platform: play video games. Over 90% of our users play games, spending a combined 1.5 billion hours playing thousands of unique titles on Discord each month. Discord plays a uniquely important role in the future of gaming. We are focused on making it easier and more fun for people to talk and hang out before, during, and after playing games. Join our team as a full-stack Staff Software Engineer - UI/UX Specialist . In this role, you will lead the creation of beautiful, intuitive user interfaces across Discord's web and mobile platforms. We're looking for someone with deep expertise in React who is passionate about design, animations, and user interactions , is excited to build world-class user experiences, and is comfortable navigating the entire technical stack. This role reports to one of our engineering leaders on our Core Product team. If you love crafting pixel-perfect UI, seamless user experiences, and scalable front-end architecture, we'd love to hear from you! What you will be doing Implement Highly Polished UIs: Function as both a thought leader who can craft thoughtful solutions to design problems both independently and in collaboration with dedicated designers. Bring interfaces to life with smooth web animations and delightful interactions, translating design concepts into pixel-perfect, high-quality code Front-End Excellence: Write clean, maintainable code in React and React Native , and drive best practices in performance and accessibility for all UI components across web platforms Cross-Functional Collaboration: Work with Product, Design, and Marketing to define your team's vision and roadmap by thoroughly understanding the needs of our users. Seamlessly transition between designing independently and implementing designs from the design team Technical Leadership: Mentor engineers and set high code standards. Guide front-end architecture decisions, and champion UI/UX quality at Discord What you will be doing Implement Highly Polished UIs: Function as both a thought leader who can craft thoughtful solutions to design problems both independently and in collaboration with dedicated designers. Bring interfaces to life with smooth web animations and delightful interactions , translating design concepts into pixel-perfect, high-quality code Front-End Excellence: Write clean, maintainable code in React and React Native , and drive best practices in performance and accessibility for all UI components across web platforms. Cross-Functional Collaboration: Work with Product, Design, and Marketing to define your team's vision and roadmap by thoroughly understanding the needs of our users. Seamlessly transition between designing independently and implementing designs from the design team Technical Leadership: Mentor engineers and set high code standards. Guide front-end architecture decisions, and champion UI/UX quality at Discord What you should have 8+ years of front-end development experience building rich, user-centric applications (web and/or mobile) Expertise in React: You have built complex applications and understand the React ecosystem/libraries deeply. You're eager to expand into React Native and excited about the opportunity to apply your React expertise to mobile development. Strong design sensibility: Passion for great design and user experience. You have an eye for detail and experience creating visually compelling interfaces Web animations expertise: Proven experience implementing smooth, performant animations and micro-interactions that enhance user experience Portfolio of Work: Required - Ability to showcase specific UI examples of past work including animations, interactions, and visual design – e.g. live demos, GitHub projects, or portfolios demonstrating your front-end and design expertise Performance & Accessibility: Extensive knowledge of front-end performance optimizations and web accessibility standards like WCAG. You ensure that your UIs are not only beautiful but also fast and usable for everyone Collaboration & Communication: Excellent communication skills and the ability to work effectively with cross-functional teams Bonus Points React Native experience: Experience building mobile applications with React Native Design Systems Experience: Proven track record of building or maintaining a design system or reusable UI component library at scale. You understand design tokens, theming, and how to create components that are flexible and extensible Animation Libraries: Experience with animation libraries like Framer Motion, Lottie, or React Spring Passion for Discord or online communities This position is US-based and can be remote but if you live in the Bay Area, you're welcome to work from our beautiful SF office. The US base salary range for this full-time position is $248,000 to $279,000 + equity + benefits. Our salary ranges are determined by role and level. Within the range, individual pay is determined by additional factors, including job-related skills, experience, and relevant education or training. Please note that the compensation details listed in US role postings reflect the base salary only, and do not include equity, or benefits. Why Discord? Discord plays a uniquely important role in the future of gaming. We're a multiplatform, multigenerational and multiplayer platform that helps people deepen their friendships around games and shared interests. We believe games give us a way to have fun with our favorite people, whether listening to music together or grinding in competitive matches for diamond rank. Join us in our mission! Your future is just a click away! Discord is committed to inclusion and providing reasonable accommodations during the interview process. We want you to feel set up for success, so if you are in need of reasonable accommodations, please let your recruiter know. Please see our Applicant and Candidate Privacy Policy for details regarding Discord's collection and usage of personal information relating to the application and recruitment process by clicking HERE.",
  "salary_range": "$248,000 to $279,000",
  "experience_level": "Senior",
  "job_category": "Engineering",
  "required_skills": "React, Git, Ai",
  "benefits": "Vision, Equity, Bonus, Training",
  "visa_sponsorship": "Not specified",
  "equity_offered": "Yes",
  "salary": "$248,000",
  "remote_type": "remote"
};


async function addJob() {
  // Step 1: Upsert company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .upsert(
      {
        name: newJob.company,
        website: newJob.source_url || null,
        logo_url: null,
        size: null,
        industry: null,
      },
      { onConflict: 'name' }
    )
    .select('id')
    .single();

  if (companyError) {
    console.error('Error inserting company:', companyError.message);
    return;
  }

  const companyId = company?.id;

  // Step 2: Insert job
  const { data, error } = await supabase.from('jobs').insert({
    company_id: companyId,
    title: newJob.job_title,
    description: newJob.description || newJob.job_title,
    location: newJob.location || null,
    department: newJob.department || null,
    employment_type: newJob.employment_type || null,
    remote_type: newJob.remote_type || null,
    salary_range: newJob.salary_range || null,
    application_url: newJob.application_url || null,
    source_url: newJob.source_url || null,
    ats_type: newJob.ats_type || null,
    external_job_id: newJob.job_id,
    date_posted: newJob.date_posted || null,
    scraped_at: newJob.scraped_at || new Date().toISOString(),
    status: 'open',
  });

  if (error) {
    console.error('Error inserting job:', error.message);
  } else {
    console.log('Inserted job:', data);
  }
}

addJob();