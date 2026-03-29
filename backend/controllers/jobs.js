import axios from 'axios';

// Simple in-memory cache
const jobsCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Dummy data fallback for premium UI continuity
const MOCK_JOBS = [
  // Frontend Developer
  {
    id: 'mock-fe-1',
    jobTitle: 'Senior Frontend Engineer',
    companyName: 'Atlassian',
    location: 'Bangalore, KA',
    salary: '₹35,00,000 - ₹50,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/atlassian/jobs/',
    employmentType: 'Full-time',
    techStack: ['React', 'TypeScript', 'GraphQL', 'Tailwind'],
    domain: 'Frontend Developer'
  },
  {
    id: 'mock-fe-2',
    jobTitle: 'Frontend Developer - React',
    companyName: 'Google',
    location: 'Gurgaon, HR',
    salary: '₹40,00,000 - ₹60,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/google/jobs/',
    employmentType: 'Full-time',
    techStack: ['React', 'JavaScript', 'Web Performance'],
    domain: 'Frontend Developer'
  },
  {
    id: 'mock-fe-3',
    jobTitle: 'UI Engineer',
    companyName: 'Flipkart',
    location: 'Bangalore, KA',
    salary: '₹20,00,000 - ₹35,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/flipkart/jobs/',
    employmentType: 'Full-time',
    techStack: ['React', 'Redux', 'HTML', 'CSS'],
    domain: 'Frontend Developer'
  },
  
  // Backend Developer
  {
    id: 'mock-be-1',
    jobTitle: 'Backend Software Engineer',
    companyName: 'Amazon',
    location: 'Bangalore, KA',
    salary: '₹30,00,000 - ₹45,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/amazon/jobs/',
    employmentType: 'Full-time',
    techStack: ['Java', 'AWS', 'DynamoDB', 'Microservices'],
    domain: 'Backend Developer'
  },
  {
    id: 'mock-be-2',
    jobTitle: 'Backend Developer (Node.js)',
    companyName: 'Paytm',
    location: 'Mumbai, MH',
    salary: '₹15,00,000 - ₹25,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/paytm/jobs/',
    employmentType: 'Full-time',
    techStack: ['Node.js', 'Express', 'Redis', 'Kafka'],
    domain: 'Backend Developer'
  },
  {
    id: 'mock-be-3',
    jobTitle: 'Senior Backend Engineer (Go)',
    companyName: 'Uber',
    location: 'Gurgaon, HR',
    salary: '₹45,00,000 - ₹60,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/uber-com/jobs/',
    employmentType: 'Full-time',
    techStack: ['Go', 'gRPC', 'PostgreSQL', 'Kubernetes'],
    domain: 'Backend Developer'
  },

  // MERN Stack Developer
  {
    id: 'mock-mern-1',
    jobTitle: 'MERN Stack Developer',
    companyName: 'Cred',
    location: 'Bangalore, KA',
    salary: '₹25,00,000 - ₹40,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/cred-club/jobs/',
    employmentType: 'Full-time',
    techStack: ['MongoDB', 'Express', 'React', 'Node.js'],
    domain: 'MERN Stack Developer'
  },
  {
    id: 'mock-mern-2',
    jobTitle: 'Full Stack MERN Lead',
    companyName: 'Zepto',
    location: 'Mumbai, MH',
    salary: '₹35,00,000 - ₹50,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/zeptonow/jobs/',
    employmentType: 'Full-time',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    domain: 'MERN Stack Developer'
  },
  {
    id: 'mock-mern-3',
    jobTitle: 'MERN Engineer',
    companyName: 'Zomato',
    location: 'Gurgaon, HR',
    salary: '₹20,00,000 - ₹35,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/zomato/jobs/',
    employmentType: 'Full-time',
    techStack: ['React', 'Node.js', 'Express', 'MongoDB'],
    domain: 'MERN Stack Developer'
  },

  // DevOps Engineer
  {
    id: 'mock-devops-1',
    jobTitle: 'Cloud & DevOps Engineer',
    companyName: 'Microsoft',
    location: 'Bangalore, KA',
    salary: '₹28,00,000 - ₹45,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/microsoft/jobs/',
    employmentType: 'Full-time',
    techStack: ['Azure', 'Kubernetes', 'CI/CD', 'Terraform'],
    domain: 'DevOps Engineer'
  },
  {
    id: 'mock-devops-2',
    jobTitle: 'DevOps Specialist',
    companyName: 'IBM',
    location: 'Pune, MH',
    salary: '₹18,00,000 - ₹30,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/ibm/jobs/',
    employmentType: 'Full-time',
    techStack: ['Docker', 'Jenkins', 'Linux', 'Ansible'],
    domain: 'DevOps Engineer'
  },
  {
    id: 'mock-devops-3',
    jobTitle: 'Site Reliability Engineer',
    companyName: 'Google',
    location: 'Bangalore, KA',
    salary: '₹35,00,000 - ₹55,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/google/jobs/',
    employmentType: 'Full-time',
    techStack: ['Python', 'Golang', 'GCP', 'SRE'],
    domain: 'DevOps Engineer'
  },

  // UI/UX Designer
  {
    id: 'mock-uiux-1',
    jobTitle: 'Product Designer',
    companyName: 'Swiggy',
    location: 'Bangalore, KA',
    salary: '₹22,00,000 - ₹35,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/swiggy-in/jobs/',
    employmentType: 'Full-time',
    techStack: ['Figma', 'Prototyping', 'User Research'],
    domain: 'UI/UX Designer'
  },
  {
    id: 'mock-uiux-2',
    jobTitle: 'Senior UX Researcher',
    companyName: 'MakeMyTrip',
    location: 'Gurgaon, HR',
    salary: '₹20,00,000 - ₹30,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/makemytrip-com/jobs/',
    employmentType: 'Full-time',
    techStack: ['User Studies', 'UX Writing', 'Wireframing'],
    domain: 'UI/UX Designer'
  },
  {
    id: 'mock-uiux-3',
    jobTitle: 'Interaction Designer',
    companyName: 'Adobe',
    location: 'Pune, MH',
    salary: '₹25,00,000 - ₹45,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/adobe/jobs/',
    employmentType: 'Full-time',
    techStack: ['Adobe XD', 'Figma', 'Motion Design'],
    domain: 'UI/UX Designer'
  },

  // Java Fullstack Developer
  {
    id: 'mock-java-1',
    jobTitle: 'Java Full Stack Developer',
    companyName: 'TCS',
    location: 'Pune, MH',
    salary: '₹8,00,000 - ₹15,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/tata-consultancy-services/jobs/',
    employmentType: 'Full-time',
    techStack: ['Java', 'Spring Boot', 'Angular', 'Oracle'],
    domain: 'Java Fullstack Developer'
  },
  {
    id: 'mock-java-2',
    jobTitle: 'Senior Java Architect',
    companyName: 'Infosys',
    location: 'Bangalore, KA',
    salary: '₹25,00,000 - ₹35,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/infosys/jobs/',
    employmentType: 'Full-time',
    techStack: ['Microservices', 'Spring Boot', 'React', 'Kafka'],
    domain: 'Java Fullstack Developer'
  },
  {
    id: 'mock-java-3',
    jobTitle: 'Backend Java Developer',
    companyName: 'JPMorgan Chase',
    location: 'Mumbai, MH',
    salary: '₹20,00,000 - ₹32,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/jpmorganchase/jobs/',
    employmentType: 'Full-time',
    techStack: ['Java 17', 'Spring Data', 'AWS', 'SQL'],
    domain: 'Java Fullstack Developer'
  },

  // Database Developer
  {
    id: 'mock-db-1',
    jobTitle: 'Database Administrator',
    companyName: 'Oracle',
    location: 'Bangalore, KA',
    salary: '₹20,00,000 - ₹35,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/oracle/jobs/',
    employmentType: 'Full-time',
    techStack: ['Oracle DB', 'PL/SQL', 'Performance Tuning'],
    domain: 'Database Developer'
  },
  {
    id: 'mock-db-2',
    jobTitle: 'Data Engineer SQL',
    companyName: 'Wipro',
    location: 'Pune, MH',
    salary: '₹10,00,000 - ₹18,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/wipro/jobs/',
    employmentType: 'Full-time',
    techStack: ['SQL Server', 'ETL', 'Python', 'Snowflake'],
    domain: 'Database Developer'
  },
  {
    id: 'mock-db-3',
    jobTitle: 'Database Architect',
    companyName: 'MongoDB Inc',
    location: 'Gurgaon, HR',
    salary: '₹35,00,000 - ₹50,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/mongodbinc/jobs/',
    employmentType: 'Full-time',
    techStack: ['MongoDB', 'NoSQL', 'Database Design'],
    domain: 'Database Developer'
  },

  // .NET Developer
  {
    id: 'mock-net-1',
    jobTitle: '.NET Core Developer',
    companyName: 'Cognizant',
    location: 'Mumbai, MH',
    salary: '₹12,00,000 - ₹20,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/cognizant/jobs/',
    employmentType: 'Full-time',
    techStack: ['C#', '.NET Core', 'Azure', 'SQL Server'],
    domain: '.NET Developer'
  },
  {
    id: 'mock-net-2',
    jobTitle: 'Senior .NET Architect',
    companyName: 'Accenture',
    location: 'Pune, MH',
    salary: '₹25,00,000 - ₹35,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/accenture/jobs/',
    employmentType: 'Full-time',
    techStack: ['.NET', 'Microservices', 'React', 'Azure DevOps'],
    domain: '.NET Developer'
  },
  {
    id: 'mock-net-3',
    jobTitle: 'Fullstack .NET Engineer',
    companyName: 'Capgemini',
    location: 'Bangalore, KA',
    salary: '₹15,00,000 - ₹25,00,000',
    companyLogo: '',
    applyLink: 'https://www.linkedin.com/company/capgemini/jobs/',
    employmentType: 'Full-time',
    techStack: ['C#', 'ASP.NET', 'Angular', 'Entity Framework'],
    domain: '.NET Developer'
  }
];

export const getJobs = async (req, res) => {
  try {
    const { role = '', location = '' } = req.query;

    const cacheKey = `${role.toLowerCase()}-${location.toLowerCase()}`;
    
    // Check Cache
    if (jobsCache.has(cacheKey)) {
      const entry = jobsCache.get(cacheKey);
      if (Date.now() - entry.timestamp < CACHE_TTL) {
        return res.status(200).json({
          success: true,
          source: 'cache',
          count: entry.data.length,
          data: entry.data
        });
      }
    }

    // Try RapidAPI JSearch
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    
    // If we have an API key, perform the real fetch
    if (rapidApiKey) {
      const queryStr = `${role} jobs in ${location || 'India'}`;
      const options = {
        method: 'GET',
        url: 'https://jsearch.p.rapidapi.com/search',
        params: {
          query: queryStr,
          page: '1',
          num_pages: '1',
          country: 'in', // India
        },
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
      };

      const response = await axios.request(options);
      const rawData = response.data.data || [];
      
      // Normalize data
      const normalizedData = rawData.slice(0, 15).map((job) => ({
        id: job.job_id,
        jobTitle: job.job_title,
        companyName: job.employer_name,
        location: `${job.job_city || location}, ${job.job_state || 'India'}`,
        salary: job.job_min_salary ? `₹${job.job_min_salary} - ₹${job.job_max_salary || job.job_min_salary}` : 'Not Disclosed',
        companyLogo: job.employer_logo || '',
        applyLink: job.job_apply_link || 'https://linkedin.com/jobs',
        employmentType: job.job_employment_type || 'Full-time',
        techStack: [], // JSearch rarely provides structured tech stacks
        domain: role // Inject the searched domain back
      }));

      // Set Cache
      jobsCache.set(cacheKey, { timestamp: Date.now(), data: normalizedData });

      return res.status(200).json({
        success: true,
        source: 'jsearch-api',
        count: normalizedData.length,
        data: normalizedData
      });
    }

    // FALLBACK TO MOCK DATA (if no API Key or for reliable dev speed)
    console.warn("[Jobs API] No RAPIDAPI_KEY detected. Serving premium mock data fallbacks.");
    
    let filteredMocks = [...MOCK_JOBS];
    if (role) {
      filteredMocks = filteredMocks.filter(j => j.domain.toLowerCase() === role.toLowerCase() || j.jobTitle.toLowerCase().includes(role.toLowerCase()));
    }
    if (location) {
      filteredMocks = filteredMocks.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
    }

    // If perfectly filtered makes it empty, just show all for the "demo" aspect, or keep it empty based on strictness.
    // For premium UX flow, an empty array should technically be returned so the empty state UI triggers.
    
    return res.status(200).json({
      success: true,
      source: 'mock-fallback',
      count: filteredMocks.length,
      data: filteredMocks
    });

  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    
    // In event of an API failure, we gracefully degrade to mock data instead of crashing the frontend
    return res.status(200).json({
      success: false,
      source: 'mock-fallback-due-to-error',
      count: MOCK_JOBS.length,
      data: MOCK_JOBS
    });
  }
};
